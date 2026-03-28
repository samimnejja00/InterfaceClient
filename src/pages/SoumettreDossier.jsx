import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAgences, submitDossier } from '../services/clientApi';
import '../styles/SoumettreDossier.css';

function SoumettreDossier() {
  const { client, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [agences, setAgences] = useState([]);
  const [loadingAgences, setLoadingAgences] = useState(true);
  const [formData, setFormData] = useState({
    souscripteur: '',
    police_number: '',
    agence_id: '',
    type_prestation: '',
    demande_initiale: '',
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
    if (!formData.souscripteur.trim()) {
      setError('Le nom du souscripteur est obligatoire.');
      return;
    }
    if (!formData.police_number.trim()) {
      setError('Le numéro de police est obligatoire.');
      return;
    }
    if (!formData.agence_id) {
      setError("Veuillez sélectionner une agence.");
      return;
    }
    if (!formData.type_prestation) {
      setError('Veuillez sélectionner un type de prestation.');
      return;
    }
    if (!formData.demande_initiale.trim() || formData.demande_initiale.trim().length < 10) {
      setError('La description de la demande doit contenir au moins 10 caractères.');
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

  // Success screen
  if (successDossier) {
    return (
      <div className="dossier-container">
        <div className="dossier-card dossier-success-card">
          <div className="success-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="success-title">Dossier soumis avec succès !</h2>
          <p className="success-subtitle">
            Votre demande a été enregistrée et sera traitée dans les meilleurs délais.
          </p>
          <div className="success-details">
            <div className="detail-row">
              <span className="detail-label">Numéro de dossier</span>
              <span className="detail-value detail-id">{successDossier.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Souscripteur</span>
              <span className="detail-value">{successDossier.souscripteur}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">N° Police</span>
              <span className="detail-value">{successDossier.police_number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type</span>
              <span className="detail-value">{successDossier.type_prestation}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">État</span>
              <span className="detail-value status-badge">{successDossier.etat}</span>
            </div>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/home')}>
              Retour au tableau de bord
            </button>
            <button className="btn-secondary" onClick={() => {
              setSuccessDossier(null);
              setFormData({
                souscripteur: '',
                police_number: '',
                agence_id: '',
                type_prestation: '',
                demande_initiale: '',
              });
              setFile(null);
            }}>
              Soumettre un autre dossier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dossier-container">
      <div className="dossier-card">
        <div className="dossier-header">
          <div className="dossier-header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h1>Soumettre une demande</h1>
            <p className="dossier-subtitle">
              Remplissez les informations ci-dessous pour créer votre demande de prestation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dossier-form">
          {error && (
            <div className="dossier-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="form-section-title">Informations du contrat</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="souscripteur">Nom du souscripteur *</label>
                <input
                  type="text"
                  id="souscripteur"
                  name="souscripteur"
                  value={formData.souscripteur}
                  onChange={handleChange}
                  placeholder="Nom complet du souscripteur"
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="police_number">N° de police d'assurance *</label>
                <input
                  type="text"
                  id="police_number"
                  name="police_number"
                  value={formData.police_number}
                  onChange={handleChange}
                  placeholder="Ex: POL-2026-XXXXX"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Détails de la demande</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="agence_id">Agence *</label>
                <select
                  id="agence_id"
                  name="agence_id"
                  value={formData.agence_id}
                  onChange={handleChange}
                  disabled={loading || loadingAgences}
                  required
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
              <div className="form-field">
                <label htmlFor="type_prestation">Type de prestation *</label>
                <select
                  id="type_prestation"
                  name="type_prestation"
                  value={formData.type_prestation}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="">— Sélectionnez un type —</option>
                  <option value="Décès">Décès</option>
                  <option value="Rachat">Rachat</option>
                  <option value="Échéance">Échéance</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="demande_initiale">Description de la demande *</label>
              <textarea
                id="demande_initiale"
                name="demande_initiale"
                value={formData.demande_initiale}
                onChange={handleChange}
                placeholder="Décrivez votre demande en détail (minimum 10 caractères)..."
                rows={5}
                disabled={loading}
                required
              />
              <small className="char-count">
                {formData.demande_initiale.length} caractère{formData.demande_initiale.length !== 1 ? 's' : ''}
                {formData.demande_initiale.length > 0 && formData.demande_initiale.length < 10 && (
                  <span className="char-warning"> — minimum 10 requis</span>
                )}
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="piece_justificative">Pièce justificative (PDF, PNG, JPG) (Optionnel)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="piece_justificative"
                  name="piece_justificative"
                  accept=".pdf, .png, .jpg, .jpeg"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="file-input"
                />
              </div>
              <small className="file-hint">Taille maximale : 5 Mo.</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/home')}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
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
  );
}

export default SoumettreDossier;
