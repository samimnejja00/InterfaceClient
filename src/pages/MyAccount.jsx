import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchClientProfile } from '../services/clientApi';

function formatDate(dateValue) {
  if (!dateValue) return '-';
  return new Date(dateValue).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function ProfileField({ label, value }) {
  return (
    <div className="bg-comar-gray-bg rounded-xl p-4 border border-gray-100">
      <p className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-comar-navy break-words">{value || '-'}</p>
    </div>
  );
}

function MyAccount() {
  const { client } = useAuth();
  const [profile, setProfile] = useState(client || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        setNotice('');
        const data = await fetchClientProfile();
        if (!active) return;
        setProfile(data);
      } catch (err) {
        if (!active) return;
        const message = err?.message || 'Impossible de charger votre profil.';
        const missingProfileRoute = String(message).toLowerCase().includes('route non trouv');

        if (missingProfileRoute && client) {
          setProfile(client);
          setNotice('Le profil detaille est indisponible sur le serveur actif. Affichage des donnees de session.');
        } else {
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [client]);

  if (loading) {
    return (
      <div className="min-h-screen bg-comar-gray-bg flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-comar-gray-text">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-comar-gray-bg px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium mb-6">
              {error}
            </div>
            <Link to="/home" className="inline-flex items-center gap-2 text-comar-royal font-semibold hover:text-comar-navy transition-colors duration-200">
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const policeNumber = profile?.police_number || profile?.cin || '-';

  return (
    <div className="min-h-screen bg-comar-gray-bg">
      <div className="bg-gradient-to-r from-comar-navy to-comar-royal px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mon Compte</h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Consultez les informations de votre profil client.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 pb-12">
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-comar-navy">Profil Client</h2>
              <p className="text-sm text-comar-gray-text mt-1">
                Ces informations sont liées a votre espace client et a vos demandes de prestation.
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${profile?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {profile?.is_active ? 'Compte actif' : 'Compte inactif'}
            </span>
          </div>

          {notice && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
              {notice}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ProfileField label="Nom complet" value={profile?.nom_complet} />
            <ProfileField label="Adresse email" value={profile?.email} />
            <ProfileField label="Numero de police (contrat)" value={policeNumber} />
            <ProfileField label="Telephone" value={profile?.telephone || 'Non renseigne'} />
            <ProfileField label="Adresse" value={profile?.adresse || 'Non renseignee'} />
            <ProfileField label="Membre depuis" value={formatDate(profile?.created_at)} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-gray-100">
            <Link
              to="/home"
              className="inline-flex items-center px-5 py-2.5 bg-comar-royal text-white text-sm font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              Retour au tableau de bord
            </Link>
            <Link
              to="/soumettre-dossier"
              className="inline-flex items-center px-5 py-2.5 bg-white text-comar-navy text-sm font-semibold rounded-xl border border-gray-200 hover:bg-comar-gray-bg transition-all duration-200"
            >
              Soumettre une demande
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyAccount;
