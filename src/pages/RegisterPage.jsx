import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerClient } from '../services/clientApi';

const POLICE_NUMBER_REGEX = /^\d{8}-\d$/;

function RegisterPage() {
  const [formData, setFormData] = useState({
    nom_complet: '',
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    police_number: '',
    telephone: '',
    adresse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setAuthClient } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'police_number') {
      // Normalize legacy dash variants and keep only digits with one inserted dash (8+1 format).
      const digits = value
        .replace(/[\u2010-\u2015\u2212]/g, '-')
        .replace(/\D/g, '')
        .slice(0, 9);
      const formatted = digits.length > 8 ? `${digits.slice(0, 8)}-${digits.slice(8)}` : digits;
      setFormData({ ...formData, police_number: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!formData.nom_complet || !formData.email || !formData.mot_de_passe || !formData.police_number) {
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

    if (!POLICE_NUMBER_REGEX.test(formData.police_number.trim())) {
      setError('Format numéro de police invalide. Format attendu: 12345678-9.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerClient({
        nom_complet: formData.nom_complet,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        police_number: formData.police_number.trim(),
        telephone: formData.telephone || null,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-comar-navy via-comar-navy to-comar-royal px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <img src="/logo-comar.png" alt="COMAR Assurances" className="h-16 w-auto rounded-xl" />
            </div>
            <h1 className="text-2xl font-bold text-comar-navy">Compte créé !</h1>
            <p className="text-sm text-comar-gray-text mt-2">Votre compte client COMAR a été créé avec succès. Redirection en cours...</p>
          </div>
          <div className="flex justify-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-comar-navy via-comar-navy to-comar-royal px-4 py-12">
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src="/logo-comar.png" alt="COMAR Assurances" className="h-16 w-auto rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-comar-navy">Créer votre compte</h1>
          <p className="text-sm text-comar-gray-text mt-1">Accédez à votre espace client COMAR Assurances</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nom_complet" className="block text-sm font-medium text-comar-navy mb-1.5">
              Nom complet *
            </label>
            <input
              type="text"
              id="nom_complet"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleChange}
              placeholder="Ex: Ahmed Ben Ali"
              disabled={loading}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-comar-navy mb-1.5">
              Adresse email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              disabled={loading}
              required
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mot_de_passe" className="block text-sm font-medium text-comar-navy mb-1.5">
                Mot de passe *
              </label>
              <input
                type="password"
                id="mot_de_passe"
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                placeholder="Min. 6 caractères"
                disabled={loading}
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-comar-navy mb-1.5">
                Confirmer *
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                disabled={loading}
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-comar-navy mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: +216 XX XXX XXX"
                disabled={loading}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="police_number" className="block text-sm font-medium text-comar-navy mb-1.5">
                N° Police (Contrat) *
              </label>
              <input
                type="text"
                id="police_number"
                name="police_number"
                value={formData.police_number}
                onChange={handleChange}
                placeholder="Ex: 12345678-9"
                disabled={loading}
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{8}-[0-9]"
                title="Format attendu: 12345678-9"
                className={inputClasses}
              />
              <p className="mt-1 text-xs text-comar-gray-text">Format requis: 8 chiffres, tiret, 1 chiffre (ex: 12345678-9)</p>
            </div>
          </div>

          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-comar-navy mb-1.5">
              Adresse
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Votre adresse complète"
              disabled={loading}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-comar-royal text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-comar-royal/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center p-4 bg-comar-gray-bg rounded-xl">
          <span className="text-sm text-comar-gray-text">Déjà un compte client ? </span>
          <Link to="/login" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
            Se connecter
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2026 COMAR Assurances — PrestaTrack</p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
