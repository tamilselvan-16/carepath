export type UserRole = 
  | 'administrator' 
  | 'doctor' 
  | 'healthcare_worker' 
  | 'facility_administrator';

export interface UserProfile {
  id: string;
  auth_id?: string;
  facility_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  preferred_language: string;
  department?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
