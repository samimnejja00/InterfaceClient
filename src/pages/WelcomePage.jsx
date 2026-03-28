import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/WelcomePage.css';

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
    <div className="welcome-page">
      <div className="welcome-hero">
        <div className="welcome-shapes">
          <div className="welcome-shape"></div>
          <div className="welcome-shape"></div>
          <div className="welcome-shape"></div>
          <div className="welcome-shape"></div>
        </div>
        <div className="welcome-hero-content">
          <div className="welcome-logo">
            <img 
              src="/logo-comar.png" 
              alt="COMAR Assurances" 
              className="welcome-logo-img"
            />
          </div>
          <h1>PrestaTrack</h1>
          <p className="welcome-subtitle">
            Votre espace client pour la gestion simplifiée de vos prestations
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isAuthenticated ? (
              <>
                <button 
                  className="welcome-cta-button"
                  onClick={() => navigate('/soumettre-dossier')}
                >
                  Soumettre une demande de prestation
                  <ArrowRightIcon />
                </button>
                <button 
                  className="welcome-cta-button"
                  onClick={() => navigate('/my-requests')}
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}
                >
                  Consulter mes demandes
                  <ArrowRightIcon />
                </button>
              </>
            ) : (
              <>
                <button 
                  className="welcome-cta-button"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                  <ArrowRightIcon />
                </button>
                <button 
                  className="welcome-cta-button"
                  onClick={() => navigate('/register')}
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}
                >
                  Créer un compte
                  <ArrowRightIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="welcome-stats">
        {stats.map((stat, index) => (
          <div key={index} className="welcome-stat-item">
            <span className="welcome-stat-value">{stat.value}</span>
            <span className="welcome-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="welcome-features">
        <h2>Ce que vous pouvez faire</h2>
        <div className="welcome-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="welcome-feature-card">
              <div className="welcome-feature-icon">
                <feature.Icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="welcome-info">
        <div className="welcome-info-content">
          <h2>À propos de COMAR Assurances</h2>
          <p>
            COMAR Assurances est votre partenaire de confiance pour la protection 
            de vos biens et de votre famille. Avec PrestaTrack, nous vous offrons 
            un accès simplifié à vos prestations, pour une expérience client moderne 
            et efficace.
          </p>
          <div className="welcome-info-highlights">
            {highlights.map((highlight, index) => (
              <div key={index} className="welcome-highlight">
                <span className="welcome-check">
                  <CheckIcon />
                </span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="welcome-footer">
        <p>© 2026 COMAR Assurances — PrestaTrack. Tous droits réservés.</p>
      </div>
    </div>
  );
}

export default WelcomePage;
