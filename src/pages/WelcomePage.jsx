import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icônes SVG professionnelles
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      Icon: FileTextIcon,
      title: 'Soumettre vos demandes',
      description: 'Déposez vos demandes de prestations en ligne, 24h/24 et 7j/7'
    },
    {
      Icon: SearchIcon,
      title: 'Suivi en temps réel',
      description: "Suivez l'état de vos demandes à chaque étape du processus"
    },
    {
      Icon: ShieldIcon,
      title: 'Documents numériques',
      description: 'Téléchargez et gérez vos documents justificatifs en toute sécurité'
    },
    {
      Icon: ClockIcon,
      title: 'Historique complet',
      description: "Accédez à l'historique de toutes vos demandes passées"
    }
  ];

  const stats = [
    { value: '50K+', label: 'Clients satisfaits' },
    { value: '100K+', label: 'Demandes traitées' },
    { value: '24h', label: 'Délai moyen de réponse' }
  ];

  const highlights = [
    'Sécurité des données garantie',
    'Service disponible 24h/24',
    'Assistance client dédiée'
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-comar-navy via-comar-navy to-comar-royal min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-comar-royal/20"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/5"></div>
          <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-comar-royal/10"></div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <img 
              src="/logo-comar.png" 
              alt="COMAR Assurances" 
              className="h-20 sm:h-24 w-auto drop-shadow-lg rounded-2xl"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            PrestaTrack
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Votre espace client pour la gestion simplifiée de vos prestations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <button 
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-comar-royal text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => navigate('/soumettre-dossier')}
                >
                  Soumettre une demande de prestation
                  <ArrowRightIcon />
                </button>
                <button 
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => navigate('/my-requests')}
                >
                  Consulter mes demandes
                  <ArrowRightIcon />
                </button>
              </>
            ) : (
              <>
                <button 
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-comar-royal text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                  <ArrowRightIcon />
                </button>
                <button 
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => navigate('/register')}
                >
                  Créer un compte
                  <ArrowRightIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white -mt-12 relative z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center py-8 px-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-comar-navy">{stat.value}</span>
                <span className="text-sm text-comar-gray-text mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-comar-gray-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-comar-navy text-center mb-14">
            Ce que vous pouvez faire
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-xl bg-comar-royal/10 text-comar-royal group-hover:bg-comar-royal group-hover:text-white transition-all duration-300">
                  <feature.Icon />
                </div>
                <h3 className="text-lg font-semibold text-comar-navy mb-3">{feature.title}</h3>
                <p className="text-sm text-comar-gray-text leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Info */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-comar-navy mb-6">
            À propos de COMAR Assurances
          </h2>
          <p className="text-base sm:text-lg text-comar-gray-text leading-relaxed mb-10">
            COMAR Assurances est votre partenaire de confiance pour la protection 
            de vos biens et de votre famille. Avec PrestaTrack, nous vous offrons 
            un accès simplifié à vos prestations, pour une expérience client moderne 
            et efficace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon />
                </span>
                <span className="text-sm font-medium text-comar-gray-text">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-comar-navy py-8 text-center">
        <p className="text-white/60 text-sm">© 2026 COMAR Assurances — PrestaTrack. Tous droits réservés.</p>
      </div>
    </div>
  );
}

export default WelcomePage;
