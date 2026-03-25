import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerClient } from '../services/clientApi';
import '../styles/LoginPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    nom_complet: '',
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    telephone: '',
    cin: '',
    adresse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setAuthClient } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!formData.nom_complet || !formData.email || !formData.mot_de_passe) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (formData.mot_de_passe !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerClient({
        nom_complet: formData.nom_complet,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        telephone: formData.telephone || null,
        cin: formData.cin || null,
        adresse: formData.adresse || null,
      });

      setAuthClient(result.client);
      setSuccess(true);

      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
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
            <p className="subtitle">Votre compte client COMAR a été créé avec succès. Redirection en cours...</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="login-card" style={{ maxWidth: '460px' }}>
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
            <label htmlFor="nom_complet">Nom complet *</label>
            <input
              type="text"
              id="nom_complet"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleChange}
              placeholder="Ex: Ahmed Ben Ali"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="mot_de_passe">Mot de passe *</label>
              <input
                type="password"
                id="mot_de_passe"
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                placeholder="Min. 6 caractères"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirmer *</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: +216 XX XXX XXX"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cin">CIN</label>
              <input
                type="text"
                id="cin"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                placeholder="Numéro CIN"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Votre adresse complète"
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
          <span style={{ color: '#475569', fontSize: '0.875rem' }}>Déjà un compte client ? </span>
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

export default RegisterPage;
