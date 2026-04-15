import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetToken } from '../services/clientApi';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [emailHint, setEmailHint] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const verifyToken = async () => {
      if (!token) {
        if (!active) return;
        setTokenValid(false);
        setTokenError('Lien invalide: token manquant.');
        setVerifying(false);
        return;
      }

      try {
        setVerifying(true);
        setTokenError('');
        const result = await verifyPasswordResetToken(token);
        if (!active) return;
        setTokenValid(true);
        setEmailHint(result?.data?.email || '');
      } catch (verifyError) {
        if (!active) return;
        setTokenValid(false);
        setTokenError(verifyError.message || 'Lien de confirmation invalide ou expire.');
      } finally {
        if (active) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!tokenValid) {
      setError('Lien de confirmation invalide.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset({ token, mot_de_passe: password });
      navigate('/login', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Impossible de mettre a jour le mot de passe.');
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
          <h1 className="text-2xl font-bold text-comar-navy">Nouveau mot de passe</h1>
          <p className="text-sm text-comar-gray-text mt-1">
            Confirmez votre changement de mot de passe.
          </p>
        </div>

        {verifying ? (
          <div className="text-center py-4 text-comar-gray-text">Verification du lien...</div>
        ) : !tokenValid ? (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
              {tokenError || 'Lien de confirmation invalide ou expire.'}
            </div>
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
                Demander un nouveau lien
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {emailHint && (
              <div className="px-4 py-3 rounded-xl bg-comar-gray-bg border border-gray-200 text-comar-navy text-sm">
                Compte concerne: <span className="font-semibold">{emailHint}</span>
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-comar-navy mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caracteres"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-comar-navy mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetez le mot de passe"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-comar-royal text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-comar-royal/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Mise a jour...' : 'Confirmer le changement'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
            Retour a la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
