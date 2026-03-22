import React, { useState, useEffect } from 'react';
import { clientQuestionService } from '../services/clientQuestionService';
import '../styles/RCDashboard.css';

function RCDashboard() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await clientQuestionService.getPendingQuestions();
      setQuestions(data || []);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (questionId, newStatus) => {
    try {
      await clientQuestionService.updateQuestionStatus(questionId, newStatus);
      loadQuestions();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleReplySubmit = async (questionId) => {
    if (!replyText.trim()) return;

    try {
      await clientQuestionService.updateQuestionStatus(questionId, 'answered', replyText);
      setReplyText('');
      setSelectedQuestion(null);
      loadQuestions();
    } catch (err) {
      setError('Erreur lors de l\'envoi de la réponse');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'answered':
        return 'status-answered';
      case 'resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'answered':
        return 'Répondu';
      case 'resolved':
        return 'Résolu';
      default:
        return status;
    }
  };

  const filteredQuestions = filterStatus === 'all' 
    ? questions 
    : questions.filter(q => q.status === filterStatus);

  return (
    <div className="rc-dashboard">
      <div className="rc-header">
        <h1>Tableau de Bord - Relation Clientèle</h1>
        <p>Gérez les questions et demandes des clients</p>
      </div>

      <div className="rc-content">
        {error && <div className="error-alert">{error}</div>}

        <div className="rc-filters">
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            En attente ({questions.filter(q => q.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'answered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('answered')}
          >
            Répondu ({questions.filter(q => q.status === 'answered').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('resolved')}
          >
            Résolu ({questions.filter(q => q.status === 'resolved').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tous ({questions.length})
          </button>
          <button className="refresh-btn" onClick={loadQuestions}>
            🔄 Actualiser
          </button>
        </div>

        <div className="rc-questions-list">
          {loading ? (
            <div className="loading">Chargement des questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="no-questions">Aucune question trouvée</div>
          ) : (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className={`question-card ${getStatusColor(question.status)}`}
              >
                <div className="question-header">
                  <div className="question-meta">
                    <h3 className="question-text">{question.question}</h3>
                    <p className="client-info">
                      Client: <strong>{question.clients?.name || 'N/A'}</strong> 
                      ({question.clients?.email})
                    </p>
                  </div>
                  <div className="status-badge">
                    <span className={`badge ${getStatusColor(question.status)}`}>
                      {getStatusLabel(question.status)}
                    </span>
                  </div>
                </div>

                <div className="question-details">
                  <p>
                    <small>
                      Reçue le: {new Date(question.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </p>

                  {question.answer && (
                    <div className="question-answer">
                      <strong>Réponse:</strong>
                      <p>{question.answer}</p>
                    </div>
                  )}

                  {question.status === 'pending' && (
                    <div className="question-actions">
                      <button
                        className="btn-reply"
                        onClick={() => setSelectedQuestion(question.id)}
                      >
                        ✉️ Répondre
                      </button>
                    </div>
                  )}

                  {question.status === 'answered' && (
                    <div className="question-actions">
                      <button
                        className="btn-resolve"
                        onClick={() => handleStatusUpdate(question.id, 'resolved')}
                      >
                        ✓ Marquer comme Résolu
                      </button>
                    </div>
                  )}
                </div>

                {selectedQuestion === question.id && (
                  <div className="reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      className="reply-input"
                      rows="4"
                    />
                    <div className="reply-actions">
                      <button
                        className="btn-send"
                        onClick={() => handleReplySubmit(question.id)}
                      >
                        Envoyer la Réponse
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setSelectedQuestion(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RCDashboard;
