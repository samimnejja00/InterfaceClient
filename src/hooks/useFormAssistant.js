import { useState } from 'react';
import { assistantService } from '../services/assistantService';
import { clientQuestionService } from '../services/clientQuestionService';

const useFormAssistant = (formData, onFormUpdate) => {
  const [currentStep, setCurrentStep] = useState('tipoPrestation');
  const [steps] = useState(['tipoPrestation', 'policyNumber', 'montant', 'detailsDemande']);

  const getNextQuestion = () => {
    return assistantService.getQuestionForStep(currentStep);
  };

  const processAnswer = async (userInput) => {
    try {
      // Check if it's a form-related answer
      const isFormAnswer = assistantService.isValidAnswer(currentStep, userInput);

      if (isFormAnswer) {
        // Auto-fill the form field
        const fieldValue = assistantService.parseAnswer(currentStep, userInput);
        onFormUpdate({ [currentStep]: fieldValue });

        // Move to next step
        const nextStepIndex = steps.indexOf(currentStep) + 1;
        if (nextStepIndex < steps.length) {
          setCurrentStep(steps[nextStepIndex]);
          return {
            message: assistantService.getAcknowledgement(currentStep) + ' ' + 
                     assistantService.getQuestionForStep(steps[nextStepIndex]),
            isFormComplete: false
          };
        } else {
          return {
            message: '✅ Parfait! Votre formulaire est complété. Vous pouvez maintenant soumettre votre demande. Pouvez-vous me poser d\'autres questions? 😊',
            isFormComplete: true
          };
        }
      } else {
        // This is a client question, not a form answer
        await clientQuestionService.saveQuestion({
          question: userInput,
          question_type: 'general',
          status: 'pending'
        });

        return {
          message: '💭 Merci pour votre question. J\'ai noté votre demande et l\'équipe support vous contactera bientôt. 📧\n\nPouvez-vous continuer avec ' + 
                   assistantService.getQuestionForStep(currentStep) + '?',
          isFormComplete: false
        };
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      return {
        message: 'Désolée, une erreur s\'est produite. Pourriez-vous réessayer?',
        isFormComplete: false
      };
    }
  };

  const isFormComplete = () => {
    return formData.tipoPrestation && 
           formData.policyNumber && 
           formData.montant && 
           formData.detailsDemande;
  };

  return {
    currentStep,
    getNextQuestion,
    processAnswer,
    isFormComplete
  };
};

export default useFormAssistant;
