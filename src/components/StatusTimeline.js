import React from 'react';
import '../styles/StatusTimeline.css';

function StatusTimeline({ timeline }) {
  return (
    <div className="status-timeline">
      {timeline.map((event, index) => (
        <div key={index} className={`timeline-item ${event.status}`}>
          <div className="timeline-marker">
            {event.status === 'completed' && <span className="check-mark">✓</span>}
            {event.status === 'in-progress' && <span className="progress-dot"></span>}
            {event.status === 'pending' && <span className="pending-dot"></span>}
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <h3>{event.title}</h3>
              <div className="timeline-date">
                {event.date !== 'Pending' && event.date !== 'En attente' && <span className="date">{event.date}</span>}
                {event.time !== 'Pending' && event.time !== 'En attente' && <span className="time">{event.time}</span>}
                {(event.date === 'Pending' || event.date === 'En attente') && <span className="pending-text">En attente</span>}
              </div>
            </div>
            <p className="timeline-description">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatusTimeline;
