import React from 'react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange, currentStep }) => {
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'tn', name: 'تونسي', flag: '🇹🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
              selectedLanguage === lang.code
                ? 'bg-comar-royal text-white border-comar-royal shadow-md'
                : 'bg-white text-comar-navy border-gray-200 hover:border-comar-royal/30 hover:bg-comar-gray-bg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={currentStep > 0}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
      {currentStep > 0 && (
        <p className="text-xs text-comar-gray-text italic">
          {selectedLanguage === 'tn' ? 'اللغة المختارة' : 
           selectedLanguage === 'ar' ? 'اللغة المختارة' : 
           selectedLanguage === 'en' ? 'Selected Language' : 
           'Langue sélectionnée'} : {languages.find(l => l.code === selectedLanguage)?.name}
        </p>
      )}
    </div>
  );
};

export default LanguageSelector;
