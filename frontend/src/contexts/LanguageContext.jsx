// Language Sync System - Full Platform Translation
// Supports: English, Hindi, Arabic, Assamese

import React, { createContext, useContext, useState, useEffect } from 'react';

// Language Context
const LanguageContext = createContext();

// Language Translations
const translations = {
  en: {
    // Navigation
    home: 'HOME',
    aiHub: 'AI HUB',
    studyHub: 'STUDY HUB',
    skillLab: 'SKILL LAB',
    examHub: 'EXAM HUB',
    educationHub: 'EDUCATION HUB',
    competitive: 'COMPETITIVE',
    login: 'LOGIN',
    
    // Common
    welcome: 'Welcome',
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    startLesson: 'Start Lesson',
    exploreResources: 'Explore Resources',
    
    // Voice Commands
    voiceCommands: 'Voice Commands',
    listening: 'LISTENING',
    voiceActivated: 'Voice commands activated',
    voiceDeactivated: 'Voice commands deactivated',
    commandNotRecognized: 'Command not recognized',
    
    // SARA Messages
    saraWelcome: 'Hello! I am SARA, your AI teacher. How can I help you today?',
    saraListening: 'I am listening...',
    saraProcessing: 'Processing your request...',
    
    // Skill Hub
    computerMastery: 'Computer Mastery',
    codingLab: 'Coding Lab',
    aiSpecialist: 'AI-Tool Specialist',
    earnBadge: 'Earn Your Golden Badge!',
    startQuiz: 'Start AI Quiz',
    
    // Education
    selectBoard: 'Select Your Board',
    nationalBoards: 'National Boards',
    internationalBoards: 'International Boards',
    
    // Messages
    success: 'Success!',
    error: 'Error',
    tryAgain: 'Please try again',
  },
  
  hi: {
    // Navigation
    home: 'होम',
    aiHub: 'एआई हब',
    studyHub: 'अध्ययन हब',
    skillLab: 'कौशल लैब',
    examHub: 'परीक्षा हब',
    educationHub: 'शिक्षा हब',
    competitive: 'प्रतियोगी',
    login: 'लॉगिन',
    
    // Common
    welcome: 'स्वागत है',
    loading: 'लोड हो रहा है...',
    submit: 'सबमिट करें',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'आगे',
    startLesson: 'पाठ शुरू करें',
    exploreResources: 'संसाधन देखें',
    
    // Voice Commands
    voiceCommands: 'वॉयस कमांड',
    listening: 'सुन रहा हूं',
    voiceActivated: 'वॉयस कमांड सक्रिय',
    voiceDeactivated: 'वॉयस कमांड बंद',
    commandNotRecognized: 'कमांड समझ नहीं आया',
    
    // SARA Messages
    saraWelcome: 'नमस्ते! मैं सारा हूं, आपकी एआई शिक्षक। मैं आपकी कैसे मदद कर सकती हूं?',
    saraListening: 'मैं सुन रही हूं...',
    saraProcessing: 'आपका अनुरोध प्रोसेस कर रही हूं...',
    
    // Skill Hub
    computerMastery: 'कंप्यूटर महारत',
    codingLab: 'कोडिंग लैब',
    aiSpecialist: 'एआई विशेषज्ञ',
    earnBadge: 'गोल्डन बैज पाएं!',
    startQuiz: 'क्विज शुरू करें',
    
    // Education
    selectBoard: 'अपना बोर्ड चुनें',
    nationalBoards: 'राष्ट्रीय बोर्ड',
    internationalBoards: 'अंतर्राष्ट्रीय बोर्ड',
    
    // Messages
    success: 'सफलता!',
    error: 'त्रुटि',
    tryAgain: 'कृपया पुनः प्रयास करें',
  },
  
  ar: {
    // Navigation
    home: 'الرئيسية',
    aiHub: 'مركز الذكاء الاصطناعي',
    studyHub: 'مركز الدراسة',
    skillLab: 'مختبر المهارات',
    examHub: 'مركز الامتحان',
    educationHub: 'مركز التعليم',
    competitive: 'تنافسي',
    login: 'تسجيل الدخول',
    
    // Common
    welcome: 'مرحباً',
    loading: 'جاري التحميل...',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    startLesson: 'بدء الدرس',
    exploreResources: 'استكشاف الموارد',
    
    // Voice Commands
    voiceCommands: 'أوامر صوتية',
    listening: 'الاستماع',
    voiceActivated: 'تم تفعيل الأوامر الصوتية',
    voiceDeactivated: 'تم إيقاف الأوامر الصوتية',
    commandNotRecognized: 'الأمر غير معروف',
    
    // SARA Messages
    saraWelcome: 'مرحباً! أنا سارا، معلمتك الذكية. كيف يمكنني مساعدتك اليوم؟',
    saraListening: 'أنا أستمع...',
    saraProcessing: 'جاري معالجة طلبك...',
    
    // Skill Hub
    computerMastery: 'إتقان الكمبيوتر',
    codingLab: 'مختبر البرمجة',
    aiSpecialist: 'أخصائي الذكاء الاصطناعي',
    earnBadge: 'احصل على الشارة الذهبية!',
    startQuiz: 'ابدأ الاختبار',
    
    // Education
    selectBoard: 'اختر مجلسك',
    nationalBoards: 'المجالس الوطنية',
    internationalBoards: 'المجالس الدولية',
    
    // Messages
    success: 'نجاح!',
    error: 'خطأ',
    tryAgain: 'يرجى المحاولة مرة أخرى',
  },
  
  as: {
    // Navigation (Assamese)
    home: 'মূল পৃষ্ঠা',
    aiHub: 'এআই হাব',
    studyHub: 'অধ্যয়ন হাব',
    skillLab: 'দক্ষতা পৰীক্ষাগাৰ',
    examHub: 'পৰীক্ষা হাব',
    educationHub: 'শিক্ষা হাব',
    competitive: 'প্ৰতিযোগিতামূলক',
    login: 'লগইন',
    
    // Common
    welcome: 'স্বাগতম',
    loading: 'লোড হৈ আছে...',
    submit: 'দাখিল কৰক',
    cancel: 'বাতিল কৰক',
    save: 'সংৰক্ষণ কৰক',
    close: 'বন্ধ কৰক',
    back: 'পিছলৈ',
    next: 'পৰৱৰ্তী',
    startLesson: 'পাঠ আৰম্ভ কৰক',
    exploreResources: 'সম্পদ অন্বেষণ কৰক',
    
    // Voice Commands
    voiceCommands: 'কণ্ঠস্বৰ আদেশ',
    listening: 'শুনি আছে',
    voiceActivated: 'কণ্ঠস্বৰ আদেশ সক্ৰিয়',
    voiceDeactivated: 'কণ্ঠস্বৰ আদেশ নিষ্ক্ৰিয়',
    commandNotRecognized: 'আদেশ চিনাক্ত কৰিব পৰা নাই',
    
    // SARA Messages
    saraWelcome: 'নমস্কাৰ! মই চাৰা, আপোনাৰ এআই শিক্ষক। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
    saraListening: 'মই শুনি আছোঁ...',
    saraProcessing: 'আপোনাৰ অনুৰোধ প্ৰক্ৰিয়াকৰণ কৰি আছে...',
    
    // Skill Hub
    computerMastery: 'কম্পিউটাৰ দক্ষতা',
    codingLab: 'কোডিং পৰীক্ষাগাৰ',
    aiSpecialist: 'এআই বিশেষজ্ঞ',
    earnBadge: 'সোণালী বেজ লাভ কৰক!',
    startQuiz: 'কুইজ আৰম্ভ কৰক',
    
    // Education
    selectBoard: 'আপোনাৰ বৰ্ড নিৰ্বাচন কৰক',
    nationalBoards: 'ৰাষ্ট্ৰীয় বৰ্ড',
    internationalBoards: 'আন্তৰ্জাতিক বৰ্ড',
    
    // Messages
    success: 'সফলতা!',
    error: 'ত্ৰুটি',
    tryAgain: 'পুনৰ চেষ্টা কৰক',
  }
};

// Language codes for Speech Recognition
const speechLangCodes = {
  en: 'en-US',
  hi: 'hi-IN',
  ar: 'ar-SA',
  as: 'as-IN'
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Load saved language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('wings_language');
    if (savedLang && translations[savedLang]) {
      changeLanguage(savedLang);
    }
  }, []);

  // Change Language
  const changeLanguage = (lang) => {
    if (!translations[lang]) return;
    
    setCurrentLanguage(lang);
    setIsRTL(lang === 'ar'); // Arabic is RTL
    localStorage.setItem('wings_language', lang);
    
    // Update HTML dir and lang attributes
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update voice recognition language
    if (window.recognitionRef) {
      try {
        window.recognitionRef.lang = speechLangCodes[lang];
      } catch (e) {
        console.log('Voice recognition language update pending');
      }
    }
    
    // Speak language change confirmation
    const messages = {
      en: 'Language changed to English',
      hi: 'भाषा हिंदी में बदल गई',
      ar: 'تم تغيير اللغة إلى العربية',
      as: 'ভাষা অসমীয়ালৈ সলনি কৰা হৈছে'
    };
    
    speakInLanguage(messages[lang], lang);
  };

  // Speak text in specific language
  const speakInLanguage = (text, lang = currentLanguage) => {
    if (!window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangCodes[lang];
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  // Get translation
  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  // Get all translations for current language
  const getAll = () => {
    return translations[currentLanguage];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getAll,
    isRTL,
    speechLangCode: speechLangCodes[currentLanguage],
    speakInLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
