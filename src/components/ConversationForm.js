import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { translations } from '../translations/translations';
import './ConversationForm.css';

const ConversationForm = ({ clientInfo }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [currentStep, setCurrentStep] = useState(-1); // Start with -1 for language selection
  const [messages, setMessages] = useState([]);
  
  const [formData, setFormData] = useState({
    policyNumber: '',
    tipoPrestation: '',
    montant: '',
    detailsDemande: '',
    documents: []
  });
  
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const t = (key, params = {}) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, segment) => current && current[segment], obj);
    };
    let text = getNestedValue(translations[selectedLanguage], key) || getNestedValue(translations.fr, key) || key;
    if (typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }
    return text;
  };

  const getQuestions = (lang) => {
    console.log('Getting questions for language:', lang);
    console.log('Available translations:', Object.keys(translations));
    
    const t = (key, params = {}) => {
      const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, segment) => current && current[segment], obj);
      };
      let text = getNestedValue(translations[lang], key) || getNestedValue(translations.fr, key) || key;
      if (typeof text === 'string') {
        Object.keys(params).forEach(param => {
          text = text.replace(`{${param}}`, params[param]);
        });
      }
      return text;
    };

    const questionsData = translations[lang]?.questions || translations.fr?.questions || [];
    console.log('Questions data for', lang, ':', questionsData);

    return [
      {
        id: 'tipoPrestation',
        question: questionsData[0]?.tipoPrestation || 'Quel type de prestation demandez-vous ?',
        placeholder: questionsData[1]?.tipoPrestation || 'Sélectionnez une option...',
        type: 'select',
        options: [
          'Rachat partiel',
          'Avance sur contrat', 
          'Transfert',
          'Résiliation'
        ]
      },
      {
        id: 'policyNumber',
        question: questionsData[0]?.policyNumber || 'Merci ! Quel est votre numéro de police d\'assurance ?',
        placeholder: questionsData[1]?.policyNumber || 'Ex: POL-2024-123456',
        type: 'text'
      },
      {
        id: 'montant',
        question: questionsData[0]?.montant || 'Parfait ! Quel montant souhaitez-vous demander ?',
        placeholder: questionsData[1]?.montant || 'Entrez le montant en €',
        type: 'number'
      },
      {
        id: 'detailsDemande',
        question: questionsData[0]?.detailsDemande || 'Dernière question ! Pouvez-vous décrire les détails de votre demande ?',
        placeholder: questionsData[1]?.detailsDemande || 'Décrivez les motifs et circonstances de votre demande...',
        type: 'textarea'
      },
      {
        id: 'documents',
        question: questionsData[0]?.documents || 'Excellent ! Veuillez maintenant télécharger les pièces justificatives pour votre demande.',
        placeholder: questionsData[1]?.documents || 'Cliquez pour sélectionner les fichiers',
        type: 'file'
      }
    ];
  };

  const prestationLabels = t('prestationTypes');

  const questions = getQuestions(selectedLanguage);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update questions when language changes
    const newQuestions = getQuestions(selectedLanguage);
    if (currentStep >= 0 && currentStep < newQuestions.length) {
      // Re-render the current question with new language
      const currentQuestion = newQuestions[currentStep];
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.id.startsWith('bot-question-'));
        return [...filtered, {
          id: `bot-question-${currentStep}`,
          sender: 'bot',
          text: currentQuestion.question,
          timestamp: new Date(),
          questionData: currentQuestion
        }];
      });
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (currentStep === 0 && messages.length === 0) {
      // Start conversation after language selection
      setTimeout(() => {
        setMessages([{
          id: 'bot-welcome',
          sender: 'bot',
          text: t('welcome', { name: clientInfo?.name || 'cher client' }),
          timestamp: new Date()
        }]);
      }, 500);
    }
  }, [selectedLanguage, currentStep]);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < questions.length && !showSummary) {
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
    }
  }, [currentStep, showSummary, selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const askNextQuestion = () => {
    const currentQuestions = getQuestions(selectedLanguage);
    if (currentStep >= 0 && currentStep < currentQuestions.length) {
      const question = currentQuestions[currentStep];
      setIsTyping(true);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-question-${currentStep}`,
          sender: 'bot',
          text: question.question,
          timestamp: new Date(),
          questionData: question
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleLanguageChange = (language) => {
    console.log('Language changing to:', language);
    setSelectedLanguage(language);
    setCurrentStep(0);
    setMessages([]);
    
    // Force re-render with new language
    setTimeout(() => {
      const newQuestions = getQuestions(language);
      console.log('New questions after language change:', newQuestions);
    }, 100);
  };

  const handleUserResponse = (response) => {
    if (currentStep < 0) return;
    
    const currentQuestions = getQuestions(selectedLanguage);
    const question = currentQuestions[currentStep];
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-response-${currentStep}`,
      sender: 'user',
      text: formatUserResponse(response, question),
      timestamp: new Date()
    }]);

    // Update form data
    setFormData(prev => ({
      ...prev,
      [question.id]: response
    }));

    // Add confirmation message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-confirm-${currentStep}`,
        sender: 'bot',
        text: t('confirm'),
        timestamp: new Date()
      }]);

      // Move to next step or show summary
      if (currentStep < currentQuestions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          setShowSummary(true);
          showSummaryMessage();
        }, 1000);
      }
    }, 500);
  };

  const formatUserResponse = (response, question) => {
    const currentPrestationLabels = t('prestationTypes');
    
    if (question.type === 'select') {
      return currentPrestationLabels[response] || response;
    }
    if (question.type === 'number') {
      const currency = selectedLanguage === 'tn' ? 'دت' : '€';
      return `${response} ${currency}`;
    }
    if (question.type === 'file') {
      const fileText = selectedLanguage === 'tn' ? 'وثيقة' : 
                      selectedLanguage === 'ar' ? 'ملف' : 
                      selectedLanguage === 'en' ? 'file(s)' : 'fichier(s)';
      
      const sentText = selectedLanguage === 'tn' ? 'صيفطات' : 
                      selectedLanguage === 'ar' ? 'أرسلت' : 
                      selectedLanguage === 'en' ? 'sent' : 'envoyé(s)';

      return `📎 ${response.length} ${fileText} ${sentText}`;
    }
    return response;
  };

  const showSummaryMessage = () => {
    setMessages(prev => [...prev, {
      id: 'bot-summary',
      sender: 'bot',
      text: t('summary'),
      timestamp: new Date(),
      isSummary: true
    }]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const requestId = 'DEM-' + new Date().getFullYear() + '-' + 
        Math.floor(Math.random() * 100000).toString().padStart(6, '0');
      
      setMessages(prev => [...prev, {
        id: 'bot-success',
        sender: 'bot',
        text: t('success', { requestId }),
        timestamp: new Date()
      }]);

      setTimeout(() => {
        navigate('/my-requests');
      }, 3000);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'bot-error',
        sender: 'bot',
        text: t('error'),
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    const currentQuestions = getQuestions(selectedLanguage);
    const stepIndex = currentQuestions.findIndex(q => q.id === field);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
      setShowSummary(false);
      setMessages(prev => [...prev, {
        id: `bot-edit-${field}`,
        sender: 'bot',
        text: currentQuestions[stepIndex].question,
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    handleUserResponse(files);
  };

  const renderInput = () => {
    if (showSummary || currentStep < 0) return null;
    
    const currentQuestions = getQuestions(selectedLanguage);
    const question = currentQuestions[currentStep];
    if (!question) return null;

    switch (question.type) {
      case 'select':
        return (
          <div className="conversation-input">
            <select
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="select-input"
            >
              <option value="">{question.placeholder}</option>
              {question.options.map(option => (
                <option key={option} value={option}>{t('prestationTypes')[option]}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (currentInput) {
                  handleUserResponse(currentInput);
                  setCurrentInput('');
                }
              }}
              disabled={!currentInput}
              className="send-button"
            >
              {t('buttons.send')}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <div className="conversation-input">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={question.placeholder}
              className="textarea-input"
              rows="3"
            />
            <button
              onClick={() => {
                if (currentInput.trim()) {
                  handleUserResponse(currentInput);
                  setCurrentInput('');
                }
              }}
              disabled={!currentInput.trim()}
              className="send-button"
            >
              {t('buttons.send')}
            </button>
          </div>
        );

      case 'file':
        return (
          <div className="conversation-input">
            <label className="file-input-label">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
              <div className="file-upload-box">
                📄 {question.placeholder}
              </div>
            </label>
          </div>
        );

      default:
        return (
          <div className="conversation-input">
            <input
              type={question.type}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={question.placeholder}
              className="text-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentInput.trim()) {
                  handleUserResponse(currentInput);
                  setCurrentInput('');
                }
              }}
            />
            <button
              onClick={() => {
                if (currentInput.trim()) {
                  handleUserResponse(currentInput);
                  setCurrentInput('');
                }
              }}
              disabled={!currentInput.trim()}
              className="send-button"
            >
              {t('buttons.send')}
            </button>
          </div>
        );
    }
  };

  const renderSummary = () => {
    if (!showSummary) return null;

    const currentPrestationLabels = t('prestationTypes');

    return (
      <div className="summary-container">
        <div className="summary-card">
          <h3>📋 {t('summary').replace('**', '').replace('**', '')}</h3>
          
          <div className="summary-item">
            <span className="summary-label">{t('labels.tipoPrestation')}</span>
            <span className="summary-value">{currentPrestationLabels[formData.tipoPrestation]}</span>
            <button onClick={() => handleEdit('tipoPrestation')} className="edit-button">{t('buttons.edit')}</button>
          </div>

          <div className="summary-item">
            <span className="summary-label">{t('labels.policyNumber')}</span>
            <span className="summary-value">{formData.policyNumber}</span>
            <button onClick={() => handleEdit('policyNumber')} className="edit-button">{t('buttons.edit')}</button>
          </div>

          <div className="summary-item">
            <span className="summary-label">{t('labels.montant')}</span>
            <span className="summary-value">{formData.montant} {selectedLanguage === 'tn' ? 'دت' : '€'}</span>
            <button onClick={() => handleEdit('montant')} className="edit-button">{t('buttons.edit')}</button>
          </div>

          <div className="summary-item">
            <span className="summary-label">{t('labels.detailsDemande')}</span>
            <span className="summary-value">{formData.detailsDemande}</span>
            <button onClick={() => handleEdit('detailsDemande')} className="edit-button">{t('buttons.edit')}</button>
          </div>

          <div className="summary-item">
            <span className="summary-label">{t('labels.documents')}</span>
            <span className="summary-value">
              📎 {formData.documents.length} {
                selectedLanguage === 'tn' ? 'وثيقة صيفطات' : 
                selectedLanguage === 'ar' ? 'ملف أرسلت' : 
                selectedLanguage === 'en' ? 'file(s) sent' : 
                'fichier(s) envoyé(s)'
              }
            </span>
            <button onClick={() => handleEdit('documents')} className="edit-button">{t('buttons.edit')}</button>
          </div>

          <div className="summary-actions">
            <button
              onClick={() => navigate('/my-requests')}
              className="cancel-button"
              disabled={loading}
            >
              {t('buttons.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-button"
            >
              {loading ? (selectedLanguage === 'tn' ? 'تصيفط...' : selectedLanguage === 'ar' ? 'جاري الإرسال...' : selectedLanguage === 'en' ? 'Sending...' : 'Envoi en cours...') : t('buttons.submit')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="conversation-form">
      <div className="conversation-header">
        <h1>💬 {selectedLanguage === 'tn' ? 'صايلب طلبك' : selectedLanguage === 'ar' ? 'إنشاء طلبك' : selectedLanguage === 'en' ? 'Create your request' : 'Créer votre demande'}</h1>
        <p>{selectedLanguage === 'tn' ? 'راني نعونك خطوة بخطوة تصايلب طلبك' : selectedLanguage === 'ar' ? 'سأساعدك خطوة بخطوة في إنشاء طلبك' : selectedLanguage === 'en' ? 'I will guide you step by step to create your request' : 'Je vais vous guider pas à pas pour créer votre demande de prestation'}</p>
      </div>

      <LanguageSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        currentStep={currentStep}
      />

      <div className="conversation-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.isSummary ? (
                <div dangerouslySetInnerHTML={{ __html: message.text }} />
              ) : (
                <p>{message.text}</p>
              )}
              <span className="message-time">
                {message.timestamp.toLocaleTimeString(selectedLanguage === 'ar' ? 'ar-TN' : selectedLanguage === 'tn' ? 'fr-FR' : selectedLanguage === 'en' ? 'en-US' : 'fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {renderSummary()}
      {renderInput()}
    </div>
  );
};

export default ConversationForm;
