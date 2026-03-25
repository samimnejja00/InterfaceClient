import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import DocumentsList from '../components/DocumentsList';
import '../styles/RequestDetails.css';

function RequestDetails({ clientInfo }) {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [requestDetail, setRequestDetail] = useState({
    id: requestId || 'DEM-2024-001234',
    tipoPrestation: 'Rachat partiel',
    montant: 5000,
    date: '2024-03-10',
    status: 'En attente',
    policyNumber: 'POL-2024-001234',
    description: 'Demande de rachat partiel de mon contrat d\'assurance personnelle',
    clientName: clientInfo?.name,
    clientId: clientInfo?.clientNumber,
    documents: [
      { id: 1, name: 'Identification.pdf', uploadDate: '2024-03-10', size: '2.4 MB' },
      { id: 2, name: 'Preuve_Domicile.pdf', uploadDate: '2024-03-10', size: '1.8 MB' },
      { id: 3, name: 'Formulaire_Demande.pdf', uploadDate: '2024-03-10', size: '0.5 MB' },
    ],
    timeline: [
      {
        date: '2024-03-10',
        time: '10:30',
        title: 'Demande Soumise',
        description: 'Votre demande a été soumise avec succès.',
        status: 'completed'
      },
      {
        date: '2024-03-11',
        time: 'En attente',
        title: 'Examen Initial',
        description: 'Votre demande est en attente d\'examen initial par notre équipe.',
        status: 'in-progress'
      },
      {
        date: 'En attente',
        time: 'En attente',
        title: 'Décision d\'Approbation',
        description: 'En attente de la décision d\'approbation finale.',
        status: 'pending'
      },
      {
        date: 'En attente',
        time: 'En attente',
        title: 'Traitement',
        description: 'Une fois approuvée, votre demande sera traitée.',
        status: 'pending'
      },
    ]
  });

  const getStatusColor = (status) => {
    const statusColors = {
      'En attente': '#FFA500',
      'En cours': '#4A90E2',
      'Validé': '#27AE60',
      'Rejeté': '#E74C3C'
    };
    return statusColors[status] || '#95A5A6';
  };

  return (
    <div className="request-details-container">
      <div className="details-header">
        <div className="header-content">
          <h1>Détails de la Demande</h1>
          <p className="request-id">N° de Demande: {requestDetail.id}</p>
        </div>
        <Link to="/my-requests" className="back-link">← Retour aux Demandes</Link>
      </div>

      <div className="details-content">
        {/* Request Summary Card */}
        <section className="summary-section">
          <div className="summary-card">
            <div className="summary-item">
              <span className="label">Numéro de Police</span>
              <span className="value">{requestDetail.policyNumber}</span>
            </div>
            <div className="summary-item">
              <span className="label">Type de Prestation</span>
              <span className="value">{requestDetail.tipoPrestation}</span>
            </div>
            <div className="summary-item">
              <span className="label">Montant</span>
              <span className="value large">{requestDetail.montant.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="summary-item">
              <span className="label">Statut Actuel</span>
              <span className={`status-badge status-${requestDetail.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {requestDetail.status}
              </span>
            </div>
          </div>
        </section>

        {/* Request Information */}
        <section className="info-section">
          <h2>Informations de la Demande</h2>
          <div className="info-details">
            <div className="info-row">
              <label>Description</label>
              <p>{requestDetail.description}</p>
            </div>
            <div className="info-row">
              <label>Nom du Client</label>
              <p>{requestDetail.clientName}</p>
            </div>
            <div className="info-row">
              <label>N° de Client</label>
              <p>{requestDetail.clientId}</p>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="documents-section">
          <h2>Documents Téléchargés</h2>
          <DocumentsList documents={requestDetail.documents} />
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h2>Chronologie du Traitement</h2>
          <StatusTimeline timeline={requestDetail.timeline} />
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2>Besoin d'Aide?</h2>
          <div className="contact-card">
            <p>Si vous avez des questions sur votre demande, veuillez contacter notre équipe d'assistance:</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <a href="mailto:support@prestatrack.com">support@prestatrack.com</a>
              </div>
              <div className="contact-item">
                <span className="contact-label">Téléphone:</span>
                <a href="tel:+33123456789">+33 (0)1 23 45 67 89</a>
              </div>
              <div className="contact-item">
                <span className="contact-label">Horaires:</span>
                <span>Lundi - Vendredi, 9:00 - 17:00</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RequestDetails;
