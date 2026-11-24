import type { SupportedLanguage } from '../translations';

export const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  mr: 'mr-IN'
};

/**
 * Formats standard ISO date string using language locale
 */
export function formatLocalizedDate(dateString: string, language: SupportedLanguage = 'en'): string {
  try {
    const locale = LOCALE_MAP[language] || 'en-US';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

/**
 * Formats clinical scores and percentages with localized numerals if preferred
 */
export function formatLocalizedNumber(num: number, language: SupportedLanguage = 'en', decimals: number = 0): string {
  try {
    const locale = LOCALE_MAP[language] || 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (e) {
    return num.toFixed(decimals);
  }
}

/**
 * Notification Template Localizations for standard healthcare continuity events
 */
const NOTIF_TEMPLATES: Record<string, Record<SupportedLanguage, { title: string; messagePrefix: string }>> = {
  'New task assigned': {
    en: { title: 'New Follow-up Task Assigned', messagePrefix: 'Outreach task assigned:' },
    ta: { title: 'புதிய பின்தொடர் பணி ஒதுக்கப்பட்டது', messagePrefix: 'ஒதுக்கப்பட்ட பணி:' },
    hi: { title: 'नया फॉलो-अप कार्य सौंपा गया', messagePrefix: 'सौंपा गया कार्य:' },
    te: { title: 'కొత్త ఫాలో-అప్ టాస్క్ కేటాయించబడింది', messagePrefix: 'కేటాయించిన టాస్క్:' },
    ml: { title: 'പുതിയ ഫോളോ-അപ്പ് ടാസ്ക് നൽകി', messagePrefix: 'നൽകിയ ടാസ്ക്:' },
    kn: { title: 'ಹೊಸ ಫಾಲೋ-ಅಪ್ ಕಾರ್ಯ ನಿಯೋಜಿಸಲಾಗಿದೆ', messagePrefix: 'ನಿಯೋಜಿಸಲಾದ ಕಾರ್ಯ:' },
    bn: { title: 'নতুন ফলো-আপ কাজ বরাদ্দ করা হয়েছে', messagePrefix: 'বরাদ্দকৃত কাজ:' },
    mr: { title: 'नवीन फॉलो-अप कार्य सोपवले', messagePrefix: 'सोपवलेले कार्य:' }
  },
  'Critical Care Gap Escalation': {
    en: { title: 'High-Priority Care Gap Alert', messagePrefix: 'Continuity gap flagged:' },
    ta: { title: 'அதிமுக்கிய சிகிச்சை இடைவெளி எச்சரிக்கை', messagePrefix: 'கண்டறியப்பட்ட சிகிச்சை இடைவெளி:' },
    hi: { title: 'उच्च प्राथमिकता केयर गैप अलर्ट', messagePrefix: 'केयर गैप का पता चला:' },
    te: { title: 'అత్యవసర కేర్ గ్యాప్ హెచ్చరిక', messagePrefix: 'గుర్తించబడిన కేర్ గ్యాప్:' },
    ml: { title: 'പ്രധാനപ്പെട്ട കെയർ ഗ്യാപ്പ് അലേർട്ട്', messagePrefix: 'കണ്ടെത്തിയ കെയർ ഗ്യാപ്പ്:' },
    kn: { title: 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯ ಕೇರ್ ಗ್ಯಾಪ್ ಎಚ್ಚರಿಕೆ', messagePrefix: 'ಕೇರ್ ಗ್ಯಾಪ್ ಗುರುತಿಸಲಾಗಿದೆ:' },
    bn: { title: 'জরুরি কেয়ার গ্যাপ সতর্কতা', messagePrefix: 'চিহ্নিত কেয়ার গ্যাপ:' },
    mr: { title: 'उच्च प्राधान्य केअर गॅप सूचना', messagePrefix: 'केअर गॅप आढळली:' }
  },
  'Activity overdue': {
    en: { title: 'Care Activity Overdue', messagePrefix: 'Milestone pending past target date:' },
    ta: { title: 'சிகிச்சை செயல்பாடு காலாவதியானது', messagePrefix: 'நிலுவையில் உள்ள சிகிச்சை மைல்கல்:' },
    hi: { title: 'देखभाल गतिविधि नियत तारीख से अधिक', messagePrefix: 'नियत तिथि समाप्त:' },
    te: { title: 'కేర్ యాక్టివిటీ గడువు ముగిసింది', messagePrefix: 'గడువు దాటిన యాక్టివిటీ:' },
    ml: { title: 'കെയർ ആക്റ്റിവിറ്റി കാലഹരണപ്പെട്ടു', messagePrefix: 'കാലഹരണപ്പെട്ട ആക്റ്റിവിറ്റി:' },
    kn: { title: 'ಆರೈಕೆ ಚಟುವಟಿಕೆ ಮೀರಿದೆ', messagePrefix: 'ಗಡುವು ಮೀರಿದ ಚಟುವಟಿಕೆ:' },
    bn: { title: 'চিকিৎসা কার্যকলাপ মেয়াদোত্তীর্ণ', messagePrefix: 'মেয়াদ শেষ হওয়া কার্যকলাপ:' },
    mr: { title: 'केअर क्रियाकलाप थकीत आहे', messagePrefix: 'मुदत संपलेला क्रियाकलाप:' }
  },
  'Referral delayed': {
    en: { title: 'Referral Delayed Past Target Window', messagePrefix: 'Specialist referral awaiting intake:' },
    ta: { title: 'பரிந்துரை தாமதமானது', messagePrefix: 'சிறப்பு மருத்துவமனை பரிந்துரை தாமதம்:' },
    hi: { title: 'रेफरल में देरी हुई', messagePrefix: 'विशेषज्ञ रेफरल लंबित:' },
    te: { title: 'రెఫరల్ ఆలస్యమైంది', messagePrefix: 'స్పెషలిస్ట్ రెఫరల్ ఆలస్యం:' },
    ml: { title: 'റഫറൽ വൈകി', messagePrefix: 'സ്പെഷ്യലിസ്റ്റ് റഫറൽ വൈകുന്നു:' },
    kn: { title: 'ರೆಫರಲ್ ವಿಳಂಬವಾಗಿದೆ', messagePrefix: 'ತಜ್ಞರ ರೆಫರಲ್ ವಿಳಂಬ:' },
    bn: { title: 'রেফারেল বিলম্বিত হয়েছে', messagePrefix: 'বিশেষজ্ঞ রেফারেল বিলম্বিত:' },
    mr: { title: 'रेफरल विलंबित झाले', messagePrefix: 'तज्ञ रेफरल प्रलंबित:' }
  },
  'Referral acknowledged': {
    en: { title: 'Receiving Facility Intake Acknowledged', messagePrefix: 'Intake packet received by center:' },
    ta: { title: 'பெறும் மருத்துவமனை பரிந்துரையை ஏற்றுக்கொண்டது', messagePrefix: 'பரிந்துரை பெறப்பட்டது:' },
    hi: { title: 'प्राप्त करने वाले अस्पताल ने रेफरल स्वीकार किया', messagePrefix: 'रेफरल प्राप्त हुआ:' },
    te: { title: 'రిసీవింగ్ ఆసుపత్రి రెఫరల్‌ను స్వీకరించింది', messagePrefix: 'రెఫరల్ స్వీకరించబడింది:' },
    ml: { title: 'സ്വീകരിക്കുന്ന ആശുപത്രി റഫറൽ സ്ഥിരീകരിച്ചു', messagePrefix: 'റഫറൽ ലഭിച്ചു:' },
    kn: { title: 'ಸ್ವೀಕರಿಸುವ ಆಸ್ಪತ್ರೆಯು ರೆಫರಲ್ ಸ್ವೀಕರಿಸಿದೆ', messagePrefix: 'ರೆಫರಲ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ:' },
    bn: { title: 'প্রাপক হাসপাতাল রেফারেল গ্রহণ করেছে', messagePrefix: 'রেফারেল গৃহীত হয়েছে:' },
    mr: { title: 'स्वीकारणाऱ्या रुग्णालयाने रेफरल मान्य केले', messagePrefix: 'रेफरल प्राप्त झाले:' }
  },
  'Referral completed': {
    en: { title: 'Referral Completed & Verified', messagePrefix: 'Outpatient consultation verified completed:' },
    ta: { title: 'பரிந்துரை நிறைவடைந்து சரிபார்க்கப்பட்டது', messagePrefix: 'பரிந்துரை நிறைவுற்றது:' },
    hi: { title: 'रेफरल पूरा और सत्यापित हुआ', messagePrefix: 'रेफरल पूरा हुआ:' },
    te: { title: 'రెఫరల్ పూర్తయింది మరియు ధృవీకరించబడింది', messagePrefix: 'రెఫరల్ పూర్తయింది:' },
    ml: { title: 'റഫറൽ പൂർത്തിയായി സ്ഥിരീകരിച്ചു', messagePrefix: 'റഫറൽ പൂർത്തിയായി:' },
    kn: { title: 'ರೆಫರಲ್ ಪೂರ್ಣಗೊಂಡಿದೆ ಮತ್ತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ', messagePrefix: 'ರೆಫರಲ್ ಪೂರ್ಣಗೊಂಡಿದೆ:' },
    bn: { title: 'রেফারেল সম্পন্ন ও যাচাই করা হয়েছে', messagePrefix: 'রেফারেল সম্পন্ন:' },
    mr: { title: 'रेफरल पूर्ण आणि सत्यापित झाले', messagePrefix: 'रेफरल पूर्ण झाले:' }
  }
};

/**
 * Returns translated title and message if a template matches, otherwise original
 */
export function getTranslatedNotification(
  title: string, 
  message: string, 
  language: SupportedLanguage
): { title: string; message: string } {
  if (language === 'en') return { title, message };

  // Match template
  const matchedKey = Object.keys(NOTIF_TEMPLATES).find(k => 
    title.toLowerCase().includes(k.toLowerCase())
  );

  if (matchedKey && NOTIF_TEMPLATES[matchedKey]?.[language]) {
    const tpl = NOTIF_TEMPLATES[matchedKey][language];
    return {
      title: tpl.title,
      message: `${tpl.messagePrefix} ${message}`
    };
  }

  return { title, message };
}

/**
 * Optional Authorized Translation for patient notes with non-replacement guarantee.
 * Original clinical terms are preserved.
 */
export function translateTextToLanguage(text: string, language: SupportedLanguage): { translated: string; isTranslated: boolean } {
  if (language === 'en' || !text) {
    return { translated: text, isTranslated: false };
  }

  // Pre-compiled localized glossary for common patient-reported barriers
  const glossary: Record<SupportedLanguage, Record<string, string>> = {
    ta: {
      'transportation barrier': 'போக்குவரத்து சிரமம்',
      'no transit': 'வாகனம் இல்லை',
      'appointment delayed': 'சந்திப்பு தாமதமானது',
      'missed appointment': 'சந்திப்பு தவறியது'
    },
    hi: {
      'transportation barrier': 'यातायात की कठिनाई',
      'no transit': 'परिवहन उपलब्ध नहीं',
      'appointment delayed': 'नियुक्ति में देरी',
      'missed appointment': 'छूटी हुई नियुक्ति'
    },
    te: {
      'transportation barrier': 'రవాణా సమస్య',
      'appointment delayed': 'అపాయింట్‌మెంట్ ఆలస్యమైంది'
    },
    ml: {
      'transportation barrier': 'യാത്രാ സൗകര്യക്കുറവ്',
      'appointment delayed': 'അപ്പോയിന്റ്മെന്റ് വൈകി'
    },
    kn: {
      'transportation barrier': 'ಸಾರಿಗೆ ತೊಂದರೆ',
      'appointment delayed': 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ವಿಳಂಬ'
    },
    bn: {
      'transportation barrier': 'যাতায়াত সমস্যা',
      'appointment delayed': 'সাক্ষাতের বিলম্ব'
    },
    mr: {
      'transportation barrier': 'वाहतुकीची अडचण',
      'appointment delayed': 'अपॉइंटमेंट विलंबित'
    },
    en: {}
  };

  const langGlossary = glossary[language];
  if (!langGlossary) return { translated: text, isTranslated: false };

  let localized = text;
  let translatedAny = false;
  for (const [enTerm, locTerm] of Object.entries(langGlossary)) {
    if (localized.toLowerCase().includes(enTerm)) {
      localized = localized.replace(new RegExp(enTerm, 'gi'), locTerm);
      translatedAny = true;
    }
  }

  return { translated: localized, isTranslated: translatedAny };
}
