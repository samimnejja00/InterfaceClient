import React from 'react';
import '../styles/StatusTimeline.css';

function StatusTimeline({ timeline }) {
  return (
    <div className="status-timeline">
      {timeline.map((event, index) => (
        <div key={index} className={`timeline-item ${event.status}`}>
          <div className="timeline-marker">
            <span className="timeline-icon">{event.icon || ''}</span>
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <h3>{event.title}</h3>
              <div className="timeline-date">
                {event.date !== 'À venir' && <span className="date">{event.date}</span>}
                {event.time && <span className="time">{event.time}</span>}
                {event.date === 'À venir' && <span className="pending-text">À venir</span>}
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
