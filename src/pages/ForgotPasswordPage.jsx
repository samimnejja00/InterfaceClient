import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestPasswordReset } from '../services/clientApi';

function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const initialEmail = String(searchParams.get('email') || '').trim();
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      setSuccessMessage(result.message || 'Si un compte existe, un email de confirmation a ete envoye.');
    } catch (submitError) {
      setError(submitError.message || "Impossible d'envoyer l'email de confirmation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-comar-navy via-comar-navy to-comar-royal px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src="/logo-comar.png" alt="COMAR Assurances" className="h-16 w-auto rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-comar-navy">Mot de passe oublie</h1>
          <p className="text-sm text-comar-gray-text mt-1">
            Saisissez votre email pour recevoir un lien de confirmation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-comar-navy mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-comar-royal text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-comar-royal/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Recevoir le lien par email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
            Retour a la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
