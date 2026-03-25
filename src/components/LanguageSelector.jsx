import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ selectedLanguage, onLanguageChange, currentStep }) => {
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'tn', name: 'تونسي', flag: '🇹🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <div className="language-selector">
      <div className="language-buttons">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`language-button ${selectedLanguage === lang.code ? 'active' : ''}`}
            disabled={currentStep > 0}
          >
            <span className="flag">{lang.flag}</span>
            <span className="lang-name">{lang.name}</span>
          </button>
        ))}
      </div>
      {currentStep > 0 && (
        <p className="language-locked">
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
