// Language Selector Component - Floating Globe Icon

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া' }
  ];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <div className="fixed top-24 left-6 z-50">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full backdrop-blur-xl bg-gradient-to-r from-[#C41E3A]/80 to-[#8B0000]/80 border-2 border-[#FFD700] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        title="Change Language"
      >
        <span className="text-2xl">{currentLang.flag}</span>
      </button>

      {/* Language Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Menu */}
          <div className="absolute top-16 left-0 z-50 backdrop-blur-xl bg-black/80 rounded-2xl p-4 border-2 border-[#FFD700]/50 shadow-2xl min-w-[250px]">
            <h3 className="text-[#FFD700] font-bold text-sm mb-3 text-center">
              🌍 Select Language
            </h3>
            
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/30 border-2 border-[#FFD700]'
                      : 'bg-white/5 border-2 border-transparent hover:border-[#FFD700]/50'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold text-sm">{lang.nativeName}</div>
                    <div className="text-gray-400 text-xs">{lang.name}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <span className="text-[#FFD700]">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#FFD700]/20">
              <p className="text-gray-400 text-xs text-center">
                SARA's voice & UI will update
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
