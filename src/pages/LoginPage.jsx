import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginClient } from '../services/clientApi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthClient, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginClient({ email, mot_de_passe: password });
      setAuthClient(result.client);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-comar-navy via-comar-navy to-comar-royal px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src="/logo-comar.png" alt="COMAR Assurances" className="h-16 w-auto rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-comar-navy">PrestaTrack</h1>
          <p className="text-sm text-comar-gray-text mt-1">COMAR Assurances — Espace Client</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-comar-navy mb-1.5">
              Email
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-comar-navy mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50"
            />
          </div>

          <div className="text-right -mt-2">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200"
            >
              Mot de passe oublie ?
            </Link>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3.5 bg-comar-royal text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-comar-royal/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-comar-gray-text">Pas encore de compte ? </span>
          <Link to="/register" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
            Créer un compte
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2026 COMAR Assurances — PrestaTrack</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
