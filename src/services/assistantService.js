// Mock AI Assistant Service
// This provides guided questions and validations for form completion

const assistantResponses = {
  tipoPrestation: {
    question: '1️⃣ Quel type de prestation demandez-vous?\n\nChoisissez parmi:\n• Rachat partiel\n• Avance sur contrat\n• Transfert\n• Résiliation',
    acknowledgements: ['Compris! Vous demandez une', 'Noté, vous avez sélectionné'],
    validAnswers: ['rachat partiel', 'avance sur contrat', 'transfert', 'résiliation', 'rachat', 'avance', 'partiel']
  },
  policyNumber: {
    question: '2️⃣ Quel est votre numéro de police d\'assurance?\n\n(Format: ex. POL-123456)',
    acknowledgements: ['Parfait! Votre numéro de police est enregistré.', 'D\'accord, j\'ai noté votre numéro de police.'],
    validAnswers: [] // Any alphanumeric is valid
  },
  montant: {
    question: '3️⃣ Quel montant désirez-vous demander?\n\n(En euros, ex. 5000 ou 5000.50)',
    acknowledgements: ['Super! J\'ai noté le montant de', 'D\'accord, vous demandez'],
    validAnswers: [] // Any number is valid
  },
  detailsDemande: {
    question: '4️⃣ Décrivez brièvement les détails de votre demande.\n\n(Quelques phrases suffisent)',
    acknowledgements: ['Merci pour les détails!', 'C\'est noté! Vous avez écrit:'],
    validAnswers: [] // Any text is valid
  }
};

export const assistantService = {
  getQuestionForStep: (step) => {
    return assistantResponses[step]?.question || 'Pouvez-vous préciser?';
  },

  getAcknowledgement: (step) => {
    const acks = assistantResponses[step]?.acknowledgements || ['Compris!'];
    return acks[Math.floor(Math.random() * acks.length)];
  },

  isValidAnswer: (step, input) => {
    const validAnswers = assistantResponses[step]?.validAnswers || [];
    
    // If no specific valid answers defined, accept any non-empty input
    if (validAnswers.length === 0) {
      return input.trim().length > 0;
    }

    // Check if input contains any valid answer
    const lowerInput = input.toLowerCase();
    return validAnswers.some(answer => lowerInput.includes(answer));
  },

  parseAnswer: (step, input) => {
    switch (step) {
      case 'tipoPrestation':
        // Normalize the input to proper form value
        const typeMap = {
          'rachat': 'Rachat partiel',
          'avance': 'Avance sur contrat',
          'transfert': 'Transfert',
          'résiliation': 'Résiliation',
          'partiel': 'Rachat partiel'
        };
        
        for (const [keyword, value] of Object.entries(typeMap)) {
          if (input.toLowerCase().includes(keyword)) {
            return value;
          }
        }
        return input; // Return as-is if no match

      case 'montant':
        // Extract numbers and convert to decimal
        const match = input.match(/[\d,\.]+/);
        return match ? parseFloat(match[0].replace(',', '.')) : 0;

      case 'policyNumber':
      case 'detailsDemande':
        return input.trim();

      default:
        return input;
    }
  },

  // Hidden: Check if user is asking something off-topic
  isOffTopicQuestion: (input) => {
    const offTopicKeywords = [
      'comment', 'pourquoi', 'quand', 'combien de temps', 'tarif', 'prix',
      'assurance', 'couverture', 'garantie', 'sinistre', 'indemnisation',
      'contact', 'téléphone', 'adresse', 'agent', 'conseiller'
    ];

    const lowerInput = input.toLowerCase();
    return offTopicKeywords.some(keyword => lowerInput.includes(keyword)) &&
           !input.match(/^[A-Za-z0-9\-\.]+$/); // Not just a code/number
  }
};
