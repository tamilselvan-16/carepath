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

export interface OutreachScriptRequest {
  patient_id: string;
  patient_name: string;
  phone?: string;
  language: string; // 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'es'
  channel: 'call' | 'whatsapp' | 'sms';
  barrier: 'transit' | 'financial' | 'fear' | 'caregiver' | 'routine';
  overdue_milestones: string[];
  next_appointment_date?: string;
  clinic_name?: string;
  clinic_phone?: string;
}

export interface OutreachScriptResponse {
  script_text: string;
  key_talking_points: string[];
  whatsapp_message: string;
  sms_message: string;
  suggested_action: string;
  pronunciation_guide?: string;
  provider: 'gemini' | 'anthropic' | 'multilingual_engine';
  safety_disclaimer: string;
}

export interface ClinicalTrajectoryRequest {
  patient_id: string;
  patient_name: string;
  mrn: string;
  pathway_name: string;
  diagnosis: string;
  completed_milestones: string[];
  overdue_milestones: string[];
  pending_milestones: string[];
  days_enrolled: number;
  last_vitals?: Record<string, string>;
}

export interface ClinicalTrajectoryResponse {
  trajectory_status: 'on_track' | 'at_risk' | 'critical_deviation';
  adherence_score: number;
  deviation_alerts: {
    severity: 'warning' | 'critical';
    title: string;
    detail: string;
    protocolWindow: string;
  }[];
  prognostic_continuity_summary: string;
  counter_referral_brief: {
    clinical_course_summary: string;
    interventions_rendered: string[];
    pending_investigations_and_labs: string[];
    red_flag_warning_symptoms: string[];
    recommended_counter_referral_plan: string;
    attending_physician_statement: string;
  };
  provider: 'gemini' | 'anthropic' | 'clinical_heuristics';
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

/**
 * INNOVATION 1 (Care Coordinator / Healthcare Worker):
 * AI Multilingual Outreach Copilot
 * Generates culturally empathetic, barrier-aware talking points, WhatsApp messages, and SMS in Indian & global languages.
 */
export async function generateOutreachScript(req: OutreachScriptRequest): Promise<OutreachScriptResponse> {
  const safetyDisclaimer = 'Non-diagnostic outreach assistance for patient engagement only. Must be reviewed by the care coordinator before communication.';
  const overdueStr = req.overdue_milestones.length > 0 ? req.overdue_milestones.join(', ') : 'upcoming clinic appointment';
  const clinic = req.clinic_name || 'CarePath Health Center';
  const phone = req.clinic_phone || '+1-617-555-0200';
  const apptDate = req.next_appointment_date || 'this Thursday';

  const barrierMap: Record<string, string> = {
    transit: 'transportation difficulties or traveling distance to clinic',
    financial: 'concerns regarding treatment or test costs',
    fear: 'procedural anxiety or uncertainty about the clinical milestone',
    caregiver: 'family or caregiver scheduling conflicts',
    routine: 'busy routine or forgotten appointment schedule'
  };
  const barrierDesc = barrierMap[req.barrier] || 'routine scheduling assistance';

  const languagePromptNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    bn: 'Bengali (বাংলা)',
    mr: 'Marathi (मराठी)',
    es: 'Spanish (Español)'
  };
  const targetLang = languagePromptNames[req.language] || 'English';

  const prompt = `You are CarePath AI's empathetic field outreach assistant.
Generate a personalized, warm, barrier-sensitive communication script for patient "${req.patient_name}".
Context:
- Overdue or pending milestone: ${overdueStr}
- Known/suspected barrier: ${barrierDesc}
- Communication Channel: ${req.channel.toUpperCase()}
- Target Language: ${targetLang}
- Clinic Name: ${clinic}
- Contact Number: ${phone}
- Suggested appointment window: ${apptDate}

Guidelines:
- Tone: Extremely respectful, compassionate, supportive, non-intimidating.
- Do NOT provide medical diagnoses or alter medication dosages.
- Explicitly offer help with the barrier (e.g. transit voucher, subsidized clinic slot, flexible timing).

Return strictly JSON with keys:
1. "script_text": Complete spoken conversation script for phone call (or full text) in ${targetLang}.
2. "key_talking_points": Array of 3-4 bullet points highlighting the core messages for coordinator.
3. "whatsapp_message": Ready-to-send pre-formatted WhatsApp message in ${targetLang} with emojis and clinic phone.
4. "sms_message": Concise SMS (under 160 characters if possible) in ${targetLang}.
5. "suggested_action": Recommended coordinator action after the communication.
6. "pronunciation_guide": Brief phonetic tip in English to help a coordinator pronounce key phrases respectfully.`;

  // Gemini Live Generation
  if (config.geminiApiKey && config.geminiApiKey.length > 10 && !config.geminiApiKey.startsWith('AQ.')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${AI_SAFETY_SYSTEM_PROMPT}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            script_text: parsed.script_text,
            key_talking_points: parsed.key_talking_points || [],
            whatsapp_message: parsed.whatsapp_message,
            sms_message: parsed.sms_message,
            suggested_action: parsed.suggested_action,
            pronunciation_guide: parsed.pronunciation_guide,
            provider: 'gemini',
            safety_disclaimer: safetyDisclaimer
          };
        }
      }
    } catch (e) {
      console.warn('Gemini outreach generation error, falling back to multilingual engine:', e);
    }
  }

  // Multilingual Heuristic Engine (High quality native fallback templates)
  const localizedFallbacks: Record<string, { greeting: string; msg: string; whatsapp: string; sms: string; guide: string }> = {
    hi: {
      greeting: `नमस्ते ${req.patient_name} जी, मैं ${clinic} से आपकी केयर कोऑर्डिनेटर बात कर रही हूँ।`,
      msg: `नमस्ते ${req.patient_name} जी, मैं ${clinic} से बात कर रही हूँ। आशा है आप स्वस्थ हैं। आपके स्वास्थ्य लाभ के लिए आपका ${overdueStr} बहुत महत्वपूर्ण है। हमें ज्ञात है कि आने-जाने या समय की समस्या हो सकती है—चिंता न करें, हम आपके लिए सुविधाजनक समय और सहायता सुनिश्चित करेंगे। क्या हम इसे ${apptDate} को निर्धारित कर सकते हैं?`,
      whatsapp: `🙏 *नमस्ते ${req.patient_name} जी!* \n\nहम ${clinic} से संपर्क कर रहे हैं। आपके स्वास्थ्य की निरंतरता के लिए आपका *${overdueStr}* अति आवश्यक है। \n\nयदि आपको अस्पताल आने या समय निर्धारण में कोई कठिनाई है, तो कृपया हमें बताएं। हम आपकी पूरी सहायता करेंगे। \n\n📅 प्रस्तावित समय: ${apptDate}\n📞 हेल्पलाइन: ${phone}\n\nआपका स्वास्थ्य हमारी प्राथमिकता है!`,
      sms: `${clinic}: नमस्ते ${req.patient_name} जी, आपके ${overdueStr} के लिए अपॉइंटमेंट ${apptDate} उपलब्ध है। सहायता हेतु कॉल करें: ${phone}`,
      guide: 'Namaste [Patient Name] ji. Aapka swasthya hamari prathmikta hai.'
    },
    ta: {
      greeting: `வணக்கம் ${req.patient_name} அவர்களே, நான் ${clinic}-ல் இருந்து பேசுகிறேன்.`,
      msg: `வணக்கம் ${req.patient_name} அவர்களே, உங்கள் உடல்நலம் நலமாக உள்ளதா? உங்கள் தொடர் சிகிச்சைக்கான ${overdueStr} பரிசோதனை செய்ய வேண்டியுள்ளது. உங்களுக்கு போக்குவரத்து அல்லது ஏதேனும் சிரமங்கள் இருந்தால் நாங்கள் உதவ தயாராக உள்ளோம். ${apptDate} அன்று இதை திட்டமிடலாமா?`,
      whatsapp: `🙏 *வணக்கம் ${req.patient_name} அவர்களே!* \n\n${clinic} மருத்துவமனையிலிருந்து அழைக்கிறோம். உங்கள் பூரண குணமடைதலுக்கு *${overdueStr}* மிகவும் அவசியமாகும். \n\nவாகன வசதி அல்லது பிற சிரமங்கள் இருந்தால் தயங்காமல் தெரிவிக்கவும். \n\n📅 தேதி: ${apptDate}\n📞 தொடர்பு: ${phone}`,
      sms: `${clinic}: வணக்கம் ${req.patient_name}, உங்கள் ${overdueStr} பரிசோதனைக்கு ${apptDate} முன்பதிவு செய்ய அழைக்கவும்: ${phone}`,
      guide: 'Vanakkam [Patient Name]. Ungal udal nalam patri vinnappam seigirom.'
    },
    te: {
      greeting: `నమస్కారం ${req.patient_name} గారు, నేను ${clinic} నుండి కేర్ కోఆర్డినేటర్‌ని.`,
      msg: `నమస్కారం ${req.patient_name} గారు, మీరు ఎలా ఉన్నారు? మీ చికిత్సలో భాగంగా ${overdueStr} పూర్తి చేయడం చాలా అవసరం. మీకు రవాణా లేదా సమయ సమస్యలు ఉంటే మేము సాయం చేస్తాం. ${apptDate} న పూర్తి చేసుకుందామా?`,
      whatsapp: `🙏 *నమస్కారం ${req.patient_name} గారు!* \n\n${clinic} నుండి మీ కేర్ టీమ్. మీ సంరక్షణలో భాగంగా *${overdueStr}* ఇంకా పెండింగ్‌లో ఉంది. మీకు ఎలాంటి సహాయం కావాలన్నా మేము ఉన్నాము. \n\n📅 తేదీ: ${apptDate}\n📞 కాల్ చేయండి: ${phone}`,
      sms: `${clinic}: నమస్కారం ${req.patient_name} గారు, మీ ${overdueStr} కొరకు ${apptDate} స్లాట్ సిద్ధంగా ఉంది. వివరాలకు: ${phone}`,
      guide: 'Namaskaram [Patient Name] garu. Mee arogyam maku mukhyam.'
    },
    kn: {
      greeting: `ನಮಸ್ಕಾರ ${req.patient_name} ಅವರೇ, ನಾನು ${clinic} ನಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ.`,
      msg: `ನಮಸ್ಕಾರ ${req.patient_name} ಅವರೇ, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸುಧಾರಣೆಗಾಗಿ ${overdueStr} ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಬಹಳ ಮುಖ್ಯವಾಗಿದೆ. ಪ್ರಯಾಣದ ಅಥವಾ ಸಮಯದ ತೊಂದರೆಗಳಿದ್ದರೆ ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ. ${apptDate} ರಂದು ಇದನ್ನು ನಿಗದಿಪಡಿಸೋಣವೇ?`,
      whatsapp: `🙏 *ನಮಸ್ಕಾರ ${req.patient_name} ಅವರೇ!* \n\n${clinic} ನಿಂದ. ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ *${overdueStr}* ಪೂರ್ಣಗೊಳಿಸಬೇಕಿದೆ. \n\n📅 ದಿನಾಂಕ: ${apptDate}\n📞 ಸಂಪರ್ಕಿಸಿ: ${phone}`,
      sms: `${clinic}: ನಮಸ್ಕಾರ ${req.patient_name}, ನಿಮ್ಮ ${overdueStr} ಗಾಗಿ ${apptDate} ಸಮಯ ನಿಗದಿಯಾಗಿದೆ. ಕರೆ ಮಾಡಿ: ${phone}`,
      guide: 'Namaskara [Patient Name] avare. Nimma arogya namma javadbari.'
    },
    bn: {
      greeting: `নমস্কার ${req.patient_name} বাবু, আমি ${clinic} থেকে বলছি।`,
      msg: `নমস্কার ${req.patient_name} বাবু, আশা করি আপনি ভালো আছেন। আপনার চিকিৎসার ধারাবাহিকতার জন্য ${overdueStr} অত্যন্ত গুরুত্বপূর্ণ। আপনার যাতায়াত বা অন্য কোনো সমস্যা থাকলে আমরা সহযোগিতা করব। ${apptDate} কি আপনার সুবিধা হবে?`,
      whatsapp: `🙏 *নমস্কার ${req.patient_name} বাবু!* \n\n${clinic} থেকে যোগাযোগ করছি। আপনার সুস্থতার জন্য *${overdueStr}* সম্পন্ন করা প্রয়োজন। \n\n📅 তারিখ: ${apptDate}\n📞 হেল্পলাইন: ${phone}`,
      sms: `${clinic}: নমস্কার ${req.patient_name}, আপনার ${overdueStr} এর জন্য ${apptDate} দিনটি নির্ধারিত। যোগাযোগ: ${phone}`,
      guide: 'Nomoshkar [Patient Name] babu. Apnar shastho amader priority.'
    },
    mr: {
      greeting: `नमस्कार ${req.patient_name} जी, मी ${clinic} मधून केअर समन्वयक बोलत आहे.`,
      msg: `नमस्कार ${req.patient_name} जी, आपल्या प्रकृतीची काळजी घेण्यासाठी आपले ${overdueStr} पूर्ण करणे अतिशय आवश्यक आहे. प्रवासाची किंवा वेळेची अडचण असल्यास आम्ही मदत करू. ${apptDate} ही वेळ चालेल का?`,
      whatsapp: `🙏 *नमस्कार ${req.patient_name} जी!* \n\n${clinic} कडून संदेश. आपल्या निरोगी आरोग्यासाठी *${overdueStr}* आवश्यक आहे. \n\n📅 तारीख: ${apptDate}\n📞 संपर्क: ${phone}`,
      sms: `${clinic}: नमस्कार ${req.patient_name} जी, आपल्या ${overdueStr} साठी ${apptDate} वेळ उपलब्ध आहे. संपर्क: ${phone}`,
      guide: 'Namaskar [Patient Name] ji. Aapan kase aahat?'
    },
    es: {
      greeting: `Hola ${req.patient_name}, le habla su coordinador de atención de ${clinic}.`,
      msg: `Hola ${req.patient_name}, le llamo de ${clinic} para saber cómo sigue su salud. Vemos que tiene pendiente su ${overdueStr}. Queremos facilitarle el transporte o acomodar el horario según sus necesidades. ¿Podríamos programarlo para ${apptDate}?`,
      whatsapp: `👋 *Hola ${req.patient_name}!* \n\nLe escribimos de ${clinic}. Para asegurar su pronta recuperación, es fundamental completar su *${overdueStr}*. Si tiene problemas de transporte o cobertura, le asistimos con gusto. \n\n📅 Fecha sugerida: ${apptDate}\n📞 Teléfono: ${phone}`,
      sms: `${clinic}: Hola ${req.patient_name}, confirme su cita para ${overdueStr} el ${apptDate}. Llámenos al ${phone}`,
      guide: 'Oh-lah [Patient Name], leh ah-blah soo koh-or-dee-nah-dor.'
    },
    en: {
      greeting: `Hello ${req.patient_name}, this is your CarePath coordinator calling from ${clinic}.`,
      msg: `Hello ${req.patient_name}, I am calling from ${clinic} to check in on your recovery. I noticed that your ${overdueStr} is currently pending. We understand that ${barrierDesc} can make visits difficult, and our team is ready to assist with transit coordination or flexible booking. Would ${apptDate} work for you?`,
      whatsapp: `👋 *Hello ${req.patient_name}!* \n\nThis is your care team from *${clinic}*. We are checking in to help you complete your *${overdueStr}*. \n\nIf you have transportation or scheduling hurdles, we are here to support you every step of the way.\n\n📅 Suggested window: ${apptDate}\n📞 Direct Hotline: ${phone}\n\nYour recovery is our top priority!`,
      sms: `${clinic}: Hello ${req.patient_name}, your ${overdueStr} is due. Flexible slots available ${apptDate}. Reply or call ${phone} for assistance.`,
      guide: 'Greet warmly and verify identity before discussing clinical timeline.'
    }
  };

  const selected = localizedFallbacks[req.language] || localizedFallbacks.en;

  return {
    script_text: selected.msg,
    key_talking_points: [
      `Confirm identity and verify patient well-being empathetically`,
      `Explain clinical purpose of ${overdueStr} in simple non-technical terms`,
      `Directly offer solution to barrier: ${barrierDesc}`,
      `Agree on confirmed appointment date: ${apptDate}`
    ],
    whatsapp_message: selected.whatsapp,
    sms_message: selected.sms,
    suggested_action: `Log outreach in CarePath timeline, send WhatsApp confirmation, and verify attendance 24 hours prior to ${apptDate}.`,
    pronunciation_guide: selected.guide,
    provider: 'multilingual_engine',
    safety_disclaimer: safetyDisclaimer
  };
}

/**
 * INNOVATION 2 (Physician / Doctor):
 * AI Clinical Trajectory Forecaster & Counter-Referral / Discharge Brief Copilot
 * Generates clinical timeline analysis, missed biomarker alerts, and formal clinical handover briefs.
 */
export async function generateClinicalTrajectoryCopilot(req: ClinicalTrajectoryRequest): Promise<ClinicalTrajectoryResponse> {
  const safetyDisclaimer = 'Clinical Continuity Support Copilot. Non-diagnostic. Must be reviewed, validated, and signed off by the attending licensed physician.';

  const completed = req.completed_milestones.length > 0 ? req.completed_milestones.join('; ') : 'Intake registered';
  const overdue = req.overdue_milestones.length > 0 ? req.overdue_milestones.join('; ') : 'None';
  const pending = req.pending_milestones.length > 0 ? req.pending_milestones.join('; ') : 'Routine surveillance';

  const prompt = `You are CarePath AI's Clinical Supervision and Trajectory Copilot for Physicians.
Analyze this patient recovery pathway:
- Patient Name: ${req.patient_name} (MRN: ${req.mrn})
- Pathway: ${req.pathway_name}
- Working Diagnosis / Indication: ${req.diagnosis}
- Days Enrolled: ${req.days_enrolled} days
- Completed Clinical Milestones: ${completed}
- Overdue Milestones: ${overdue}
- Pending Milestones: ${pending}

Task:
1. Assess pathway trajectory and calculate an adherence score (0-100).
2. Identify protocol deviation alerts (specific clinical milestone windows missed and operational risks).
3. Draft an executive prognostic summary for the attending physician.
4. Auto-generate a structured Counter-Referral / Clinical Continuity Brief for handover to primary care or community clinic.

Return strictly JSON with keys:
{
  "trajectory_status": "on_track" | "at_risk" | "critical_deviation",
  "adherence_score": number,
  "deviation_alerts": [
    { "severity": "warning"|"critical", "title": string, "detail": string, "protocolWindow": string }
  ],
  "prognostic_continuity_summary": string,
  "counter_referral_brief": {
    "clinical_course_summary": string,
    "interventions_rendered": string[],
    "pending_investigations_and_labs": string[],
    "red_flag_warning_symptoms": string[],
    "recommended_counter_referral_plan": string,
    "attending_physician_statement": string
  }
}`;

  if (config.geminiApiKey && config.geminiApiKey.length > 10 && !config.geminiApiKey.startsWith('AQ.')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${AI_SAFETY_SYSTEM_PROMPT}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const json: any = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            trajectory_status: parsed.trajectory_status || 'at_risk',
            adherence_score: parsed.adherence_score || 82,
            deviation_alerts: parsed.deviation_alerts || [],
            prognostic_continuity_summary: parsed.prognostic_continuity_summary,
            counter_referral_brief: parsed.counter_referral_brief,
            provider: 'gemini',
            safety_disclaimer: safetyDisclaimer
          };
        }
      }
    } catch (e) {
      console.warn('Gemini clinical copilot error, falling back to heuristics:', e);
    }
  }

  // Clinical Heuristics Fallback Engine
  const isCritical = req.overdue_milestones.length >= 2;
  const isAtRisk = req.overdue_milestones.length === 1;
  const score = isCritical ? 64 : isAtRisk ? 79 : 92;
  const status: 'on_track' | 'at_risk' | 'critical_deviation' = isCritical ? 'critical_deviation' : isAtRisk ? 'at_risk' : 'on_track';

  const deviationAlerts = req.overdue_milestones.map(m => ({
    severity: (m.toLowerCase().includes('echo') || m.toLowerCase().includes('lab') ? 'critical' : 'warning') as 'warning' | 'critical',
    title: `Protocol Deviation: ${m}`,
    detail: `Patient has exceeded expected interval for ${m}. Continuity delay poses risk of unmonitored recovery complications.`,
    protocolWindow: 'Expected within 14-30 days post-procedure'
  }));

  if (deviationAlerts.length === 0) {
    deviationAlerts.push({
      severity: 'warning',
      title: 'Active Surveillance Window',
      detail: 'All past milestones verified. Maintain scheduled 60-day recovery checkpoint.',
      protocolWindow: 'Routine protocol window'
    });
  }

  return {
    trajectory_status: status,
    adherence_score: score,
    deviation_alerts: deviationAlerts,
    prognostic_continuity_summary: `Patient ${req.patient_name} is currently at ${score}% protocol adherence under the ${req.pathway_name} protocol. ${req.overdue_milestones.length > 0 ? `Attention required for ${req.overdue_milestones.length} overdue milestones to prevent readmission.` : 'Clinical trajectory indicates stable recovery.'}`,
    counter_referral_brief: {
      clinical_course_summary: `Patient successfully managed under ${req.pathway_name} for ${req.diagnosis}. Under continuous care coordination for ${req.days_enrolled} days.`,
      interventions_rendered: req.completed_milestones.length > 0 ? req.completed_milestones : ['Initial Clinical Intake Completed', 'Risk Stratification Done'],
      pending_investigations_and_labs: req.overdue_milestones.concat(req.pending_milestones).slice(0, 4),
      red_flag_warning_symptoms: [
        'Acute chest discomfort or radiating pain',
        'Sudden shortness of breath or nocturnal dyspnea',
        'Unexplained fever, site bleeding, or severe fatigue',
        'Systolic BP > 160 mmHg or persistent bradycardia < 50 bpm'
      ],
      recommended_counter_referral_plan: `Primary care physician to continue secondary prevention surveillance, verify completed labs within 10 days, and notify care coordinator if patient reports barrier to clinic visits.`,
      attending_physician_statement: `Certified clinical continuity summary reviewed by Attending Physician. Care pathway active in CarePath AI Network.`
    },
    provider: 'clinical_heuristics',
    safety_disclaimer: safetyDisclaimer
  };
}
