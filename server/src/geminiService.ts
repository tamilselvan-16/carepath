import { config } from './config';

export interface AISummaryRequest {
  patient_id: string;
  patient_name: string;
  rule_score: number;
  rule_category: string;
  rule_factors: string[];
  ml_probability: number;
  overdue_activities: string[];
  pending_activities: string[];
  days_since_last_activity: number;
  access_barriers: string[];
}

export interface AISummaryResponse {
  explanation: string;
  contributing_factors_summary: string;
  suggested_administrative_action: string;
  suggested_task_title: string;
  suggested_priority: 'low' | 'moderate' | 'high' | 'critical';
  provider: 'gemini' | 'anthropic' | 'rule_fallback';
  safety_disclaimer: string;
}

const AI_SAFETY_SYSTEM_PROMPT = `You are CarePath AI, a specialized healthcare continuity coordination assistant.
Your sole role is to explain identified care gaps, summarize administrative timelines, and suggest administrative coordination follow-up tasks for human healthcare coordinators.
CRITICAL AI SAFETY DIRECTIVE:
1. NEVER diagnose any medical condition.
2. NEVER prescribe or recommend clinical medications or dosage adjustments.
3. NEVER make independent clinical decisions.
4. Keep explanations focused strictly on operational workflow, attendance, lab completion, referral continuity, and administrative outreach.
5. All outputs will be reviewed and acted upon by human healthcare workers.`;

export async function generateCareGapExplanation(data: AISummaryRequest): Promise<AISummaryResponse> {
  const safetyDisclaimer = 'AI continuity assistance for administrative follow-up only. Non-diagnostic. Must be validated by an authorized healthcare worker.';

  const userPrompt = `Review the following operational continuity status for patient (ID: ${data.patient_id}):
- Rule-based Care Gap Score: ${data.rule_score}/100 (${data.rule_category.toUpperCase()})
- Contributing Operational Factors: ${data.rule_factors.join(', ') || 'None identified'}
- ML 7-Day Care-Gap Probability: ${(data.ml_probability * 100).toFixed(1)}%
- Overdue Milestones: ${data.overdue_activities.join('; ') || 'None'}
- Pending Milestones: ${data.pending_activities.join('; ') || 'None'}
- Recorded Access Barriers: ${data.access_barriers.join(', ') || 'None reported'}
- Days since last verified milestone: ${data.days_since_last_activity} days

Provide a JSON response with the following exact keys:
1. "explanation": A clear, simple 2-3 sentence explanation of the patient's care continuity gap in plain language.
2. "contributing_factors_summary": A concise operational summary of what caused this gap.
3. "suggested_administrative_action": Clear instructions for a human care coordinator on how to follow up (e.g. outreach call, transportation assistance, rescheduling).
4. "suggested_task_title": A brief 4-8 word action title for the coordinator's task queue.
5. "suggested_priority": One of "low", "moderate", "high", or "critical".

Output ONLY valid JSON without markdown wrapping.`;

  // Attempt 1: Gemini API if key is valid
  if (config.geminiApiKey && config.geminiApiKey.length > 10 && !config.geminiApiKey.startsWith('AQ.')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${AI_SAFETY_SYSTEM_PROMPT}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            explanation: parsed.explanation,
            contributing_factors_summary: parsed.contributing_factors_summary,
            suggested_administrative_action: parsed.suggested_administrative_action,
            suggested_task_title: parsed.suggested_task_title,
            suggested_priority: parsed.suggested_priority || 'high',
            provider: 'gemini',
            safety_disclaimer: safetyDisclaimer
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to Anthropic or deterministic heuristics:', e);
    }
  }

  // Attempt 2: Anthropic Claude if key is present
  if (config.anthropicApiKey && config.anthropicApiKey.startsWith('sk-ant-')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 600,
          system: AI_SAFETY_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `${userPrompt}\n\nReturn strictly valid JSON only.` }]
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        const text = json.content?.[0]?.text;
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return {
            explanation: parsed.explanation,
            contributing_factors_summary: parsed.contributing_factors_summary,
            suggested_administrative_action: parsed.suggested_administrative_action,
            suggested_task_title: parsed.suggested_task_title,
            suggested_priority: parsed.suggested_priority || 'high',
            provider: 'anthropic',
            safety_disclaimer: safetyDisclaimer
          };
        }
      }
    } catch (e) {
      console.warn('Anthropic API call fallback failed:', e);
    }
  }

  // Fallback 3: Robust Deterministic Rule-Based Continuity Explainer (Guaranteed 100% Availability)
  let priority: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
  if (data.rule_score >= 60 || data.ml_probability >= 0.70) priority = 'high';
  if (data.rule_score >= 80) priority = 'critical';

  const overdueList = data.overdue_activities.length > 0 ? data.overdue_activities.join(' and ') : 'scheduled milestones';
  const factorsList = data.rule_factors.length > 0 ? data.rule_factors.join(', ') : 'routine pending timeline';

  return {
    explanation: `The patient is showing an elevated care continuity risk with ${data.overdue_activities.length} overdue activity (${overdueList}). Operational scoring indicates potential for treatment journey disruption without coordinator contact.`,
    contributing_factors_summary: `Key operational drivers: ${factorsList}. Last recorded patient interaction was ${data.days_since_last_activity} days ago.`,
    suggested_administrative_action: `Initiate telephone outreach to confirm patient status, inquire regarding transit/scheduling barriers, and reschedule ${overdueList} within standard 7-day protocol window.`,
    suggested_task_title: `Coordinator Outreach: Resolve Overdue ${overdueList.slice(0, 30)}`,
    suggested_priority: priority,
    provider: 'rule_fallback',
    safety_disclaimer: safetyDisclaimer
  };
}
