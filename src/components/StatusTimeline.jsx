import React from 'react';

function StatusTimeline({ timeline }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          marker: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200',
          line: 'bg-emerald-500',
          title: 'text-comar-navy',
          bg: ''
        };
      case 'in-progress':
        return {
          marker: 'bg-comar-royal border-comar-royal text-white shadow-blue-200 animate-pulse',
          line: 'bg-gray-200',
          title: 'text-comar-royal font-bold',
          bg: 'bg-comar-royal/5 border-comar-royal/20'
        };
      case 'rejected':
        return {
          marker: 'bg-comar-red border-comar-red text-white shadow-red-200',
          line: 'bg-gray-200',
          title: 'text-comar-red',
          bg: 'bg-red-50 border-red-200'
        };
      default: // pending
        return {
          marker: 'bg-gray-100 border-gray-300 text-gray-400',
          line: 'bg-gray-200',
          title: 'text-gray-400',
          bg: ''
        };
    }
  };

  return (
    <div className="relative">
      {timeline.map((event, index) => {
        const styles = getStatusStyles(event.status);
        const isLast = index === timeline.length - 1;

        return (
          <div key={index} className="flex gap-4 sm:gap-6 relative">
            {/* Marker + Line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg shadow-md shrink-0 ${styles.marker}`}>
                {event.icon || ''}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[40px] ${styles.line}`}></div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
              <div className={`rounded-xl p-4 border ${styles.bg || 'border-transparent'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <h3 className={`text-sm sm:text-base font-semibold ${styles.title}`}>
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-comar-gray-text">
                    {event.date !== 'À venir' && (
                      <span className="bg-comar-gray-bg px-2 py-0.5 rounded-md font-medium">{event.date}</span>
                    )}
                    {event.time && (
                      <span className="bg-comar-gray-bg px-2 py-0.5 rounded-md font-medium">{event.time}</span>
                    )}
                    {event.date === 'À venir' && (
                      <span className="text-gray-400 italic">À venir</span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-comar-gray-text">{event.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;
