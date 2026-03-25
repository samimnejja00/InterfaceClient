import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp } from '../services/authService';
import '../styles/LoginPage.css';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, {
        name,
        clientNumber,
        phone,
      });

      if (result.success) {
        setSuccess(true);
        // Attendre 2 secondes puis rediriger
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo-comar.png" alt="COMAR Assurances" />
            </div>
            <h1>Compte créé !</h1>
            <p className="subtitle">Votre compte client COMAR a été créé. Vous allez être redirigé...</p>
          </div>
          <div className="success-message" style={{ textAlign: 'center', padding: '2rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo-comar.png" alt="COMAR Assurances" />
          </div>
          <h1>Créer votre compte</h1>
          <p className="subtitle">Accédez à votre espace client COMAR Assurances</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nom complet *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              disabled={loading}
              required
            />
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Au moins 6 caractères
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +33 6 12 34 56 78"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientNumber">Numéro Client</label>
            <input
              type="text"
              id="clientNumber"
              value={clientNumber}
              onChange={(e) => setClientNumber(e.target.value)}
              placeholder="Optionnel"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            style={{ background: loading ? '#94a3b8' : '', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="signup-link" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
          <span style={{ color: '#475569', fontSize: '0.875rem' }}>Déjà un compte client COMAR ? </span>
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
            Se connecter
          </Link>
        </div>

        <div className="login-footer" style={{ marginTop: '2rem' }}>
          <p>© 2026 COMAR Assurances — PrestaTrack</p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
