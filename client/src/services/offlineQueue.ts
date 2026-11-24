export type OfflineActionType = 
  | 'UPDATE_ACTIVITY_STATUS'
  | 'UPDATE_FOLLOWUP_TASK'
  | 'LOG_CONTACT_ATTEMPT'
  | 'ADD_ACTIVITY_NOTE'
  | 'REGISTER_OFFLINE_PATIENT';

export interface OfflineOperation {
  operation_id: string; // Unique idempotency key (UUID)
  entity_id: string; // ID of the task, activity, or temp patient ID
  entity_type: 'pathway_step' | 'followup_task' | 'patient';
  action_type: OfflineActionType;
  base_version: number; // For version conflict detection
  operation_timestamp: string;
  payload: Record<string, any>;
  status: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
  error_message?: string;
  retry_count: number;
}

const DB_NAME = 'CarePath_offline_db';
const DB_VERSION = 1;
const STORE_QUEUE = 'sync_queue';
const STORE_LOCAL_MUTATIONS = 'local_mutations';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const store = db.createObjectStore(STORE_QUEUE, { keyPath: 'operation_id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'operation_timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_LOCAL_MUTATIONS)) {
        db.createObjectStore(STORE_LOCAL_MUTATIONS, { keyPath: 'entity_id' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

/**
 * Enqueue an approved offline modification
 */
export async function queueOfflineOperation(operation: Omit<OfflineOperation, 'operation_id' | 'operation_timestamp' | 'status' | 'retry_count'>): Promise<OfflineOperation> {
  const db = await openDatabase();
  const op: OfflineOperation = {
    ...operation,
    operation_id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    operation_timestamp: new Date().toISOString(),
    status: 'pending',
    retry_count: 0
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE, STORE_LOCAL_MUTATIONS], 'readwrite');
    const queueStore = tx.objectStore(STORE_QUEUE);
    const localStore = tx.objectStore(STORE_LOCAL_MUTATIONS);

    queueStore.add(op);
    localStore.put({ entity_id: op.entity_id, last_payload: op.payload, updated_at: op.operation_timestamp });

    tx.oncomplete = () => resolve(op);
    tx.onerror = (e: any) => reject(e.target.error);
  });
}

/**
 * Get all operations currently pending synchronization
 */
export async function getPendingOperations(): Promise<OfflineOperation[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readonly');
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => {
      const all: OfflineOperation[] = request.result || [];
      resolve(all.filter(op => op.status === 'pending' || op.status === 'conflict' || op.status === 'failed'));
    };
    request.onerror = (e: any) => reject(e.target.error);
  });
}

/**
 * Remove or update an operation after successful sync
 */
export async function updateOperationStatus(operationId: string, status: OfflineOperation['status'], errorMsg?: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    const getReq = store.get(operationId);

    getReq.onsuccess = () => {
      const op = getReq.result as OfflineOperation;
      if (op) {
        if (status === 'synced') {
          store.delete(operationId);
        } else {
          op.status = status;
          if (errorMsg) op.error_message = errorMsg;
          op.retry_count += 1;
          store.put(op);
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e: any) => reject(e.target.error);
  });
}

/**
 * Clear conflict or dismissed operation
 */
export async function dismissOperation(operationId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.delete(operationId);
    tx.oncomplete = () => resolve();
    tx.onerror = (e: any) => reject(e.target.error);
  });
}
