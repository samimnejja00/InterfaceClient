import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAgences, submitDossier } from '../services/clientApi';

const DEMANDE_INITIALE_OPTIONS = [
  'Rachat Total',
  'Rachat Partiel',
  'Rachat Échu',
  'Transfert Contrat',
  'Autre',
];

function mapEtatToLabel(etat) {
  switch (etat) {
    case 'EN_COURS':
      return 'En cours';
    case 'EN_INSTANCE':
      return 'En instance';
    case 'CLOTURE':
      return 'Clôturé';
    default:
      return etat || '-';
  }
}

function formatRequestNumber(dossier) {
  if (dossier?.request_number) return dossier.request_number;
  return `DEM-${String(dossier?.id || '').slice(0, 8).toUpperCase()}`;
}

function SoumettreDossier() {
  const { client, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const contractPoliceNumber = client?.police_number || client?.cin || '';

  const [agences, setAgences] = useState([]);
  const [loadingAgences, setLoadingAgences] = useState(true);
  const [formData, setFormData] = useState({
    agence_id: '',
    demande_initiale: '',
    motif_instance: '',
    telephone: '+216 ',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successDossier, setSuccessDossier] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load agences
  useEffect(() => {
    const loadAgences = async () => {
      try {
        const result = await fetchAgences();
        setAgences(result.data || []);
      } catch (err) {
        console.error('Failed to load agences:', err);
        setError('Impossible de charger la liste des agences.');
      } finally {
        setLoadingAgences(false);
      }
    };
    if (isAuthenticated) {
      loadAgences();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size and type if needed
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5 Mo.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!contractPoliceNumber) {
      setError('Aucun numéro de police n\'est associé à votre compte.');
      return;
    }
    if (!formData.agence_id) {
      setError("Veuillez sélectionner une agence.");
      return;
    }
    if (!formData.demande_initiale) {
      setError('Veuillez sélectionner une demande initiale.');
      return;
    }
    if (!formData.motif_instance.trim() || formData.motif_instance.trim().length < 5) {
      setError("Le motif d'instance doit contenir au moins 5 caractères.");
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSubmit.append(key, formData[key]);
      });
      
      if (file) {
        dataToSubmit.append('piece_justificative', file);
      }

      const result = await submitDossier(dataToSubmit);
      setSuccessDossier(result.dossier);
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission du dossier.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50";
  const selectClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-comar-gray-bg text-comar-navy text-sm focus:outline-none focus:ring-2 focus:ring-comar-royal/40 focus:border-comar-royal transition-all duration-200 disabled:opacity-50 appearance-none cursor-pointer";

  // Success screen
  if (successDossier) {
    return (
      <div className="min-h-screen bg-comar-gray-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 animate-fade-in text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-comar-navy mb-2">Dossier soumis avec succès !</h2>
          <p className="text-sm text-comar-gray-text mb-8">
            Votre demande a été enregistrée et sera traitée dans les meilleurs délais.
          </p>
          <div className="bg-comar-gray-bg rounded-xl p-5 space-y-3 mb-8 text-left">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Numéro de demande</span>
              <span className="text-sm font-bold text-comar-royal font-mono">{formatRequestNumber(successDossier)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Souscripteur</span>
              <span className="text-sm font-medium text-comar-navy">{successDossier.souscripteur}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider">N° Police</span>
              <span className="text-sm font-medium text-comar-navy">{successDossier.police_number}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Demande initiale</span>
              <span className="text-sm font-medium text-comar-navy">{successDossier.demande_initiale || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider">État</span>
              <span className="status-badge bg-amber-100 text-amber-800">{mapEtatToLabel(successDossier.etat)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              className="flex-1 py-3 bg-comar-royal text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
              onClick={() => navigate('/home')}
            >
              Retour au tableau de bord
            </button>
            <button 
              className="flex-1 py-3 bg-comar-gray-bg text-comar-navy font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200"
              onClick={() => {
                setSuccessDossier(null);
                setFormData({
                  agence_id: '',
                  demande_initiale: '',
                  motif_instance: '',
                  telephone: '+216 ',
                });
                setFile(null);
              }}
            >
              Soumettre un autre dossier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-comar-gray-bg px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-comar-navy to-comar-royal p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Soumettre une demande</h1>
                <p className="text-white/70 text-sm mt-1">
                  Remplissez les informations ci-dessous pour créer votre demande de prestation
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Contract info section */}
            <div>
              <h3 className="text-base font-semibold text-comar-navy mb-4 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-comar-royal/10 text-comar-royal text-xs font-bold">1</span>
                Informations du contrat
              </h3>
              <div>
                <label htmlFor="contract_police_number" className="block text-sm font-medium text-comar-navy mb-1.5">
                  N° de police d'assurance (lié au compte)
                </label>
                <input
                  type="text"
                  id="contract_police_number"
                  value={contractPoliceNumber || 'Non renseigné'}
                  disabled
                  readOnly
                  className={inputClasses}
                />
                <p className="mt-1.5 text-xs text-comar-gray-text">Ce numéro est récupéré automatiquement depuis votre profil client.</p>
              </div>
            </div>

            {/* Request details section */}
            <div>
              <h3 className="text-base font-semibold text-comar-navy mb-4 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-comar-royal/10 text-comar-royal text-xs font-bold">2</span>
                Détails de la demande
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="agence_id" className="block text-sm font-medium text-comar-navy mb-1.5">
                    Agence *
                  </label>
                  <select
                    id="agence_id"
                    name="agence_id"
                    value={formData.agence_id}
                    onChange={handleChange}
                    disabled={loading || loadingAgences}
                    required
                    className={selectClasses}
                  >
                    <option value="">
                      {loadingAgences ? 'Chargement des agences...' : '— Sélectionnez une agence —'}
                    </option>
                    {agences.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.nom} ({ag.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="demande_initiale" className="block text-sm font-medium text-comar-navy mb-1.5">
                    Demande initiale *
                  </label>
                  <select
                    id="demande_initiale"
                    name="demande_initiale"
                    value={formData.demande_initiale}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className={selectClasses}
                  >
                    <option value="">— Sélectionnez une demande —</option>
                    {DEMANDE_INITIALE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="telephone" className="block text-sm font-medium text-comar-navy mb-1.5">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Ex: +216 20 123 456"
                  disabled={loading}
                  className={inputClasses}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="motif_instance" className="block text-sm font-medium text-comar-navy mb-1.5">
                  Motif d'instance *
                </label>
                <textarea
                  id="motif_instance"
                  name="motif_instance"
                  value={formData.motif_instance}
                  onChange={handleChange}
                  placeholder="Décrivez la raison de votre demande (minimum 5 caractères)..."
                  rows={5}
                  disabled={loading}
                  required
                  className={`${inputClasses} resize-y`}
                />
                <p className="mt-1.5 text-xs text-comar-gray-text">
                  {formData.motif_instance.length} caractère{formData.motif_instance.length !== 1 ? 's' : ''}
                  {formData.motif_instance.length > 0 && formData.motif_instance.length < 5 && (
                    <span className="text-comar-red font-medium"> — minimum 5 requis</span>
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="piece_justificative" className="block text-sm font-medium text-comar-navy mb-1.5">
                  Pièce justificative (PDF, PNG, JPG) (Optionnel)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="piece_justificative"
                    name="piece_justificative"
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-comar-gray-bg text-sm text-comar-gray-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-comar-royal/10 file:text-comar-royal hover:file:bg-comar-royal/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  />
                </div>
                <p className="mt-1.5 text-xs text-comar-gray-text">Taille maximale : 5 Mo.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-comar-gray-text bg-comar-gray-bg rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-comar-royal text-white text-sm font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Soumission en cours...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Soumettre la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SoumettreDossier;
