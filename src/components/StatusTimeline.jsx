import React from 'react';

function StatusTimeline({ timeline }) {

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          markerBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
          markerBorder: 'border-emerald-300',
          markerShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          line: 'from-emerald-400 to-emerald-500',
          lineSolid: 'bg-emerald-400',
          title: 'text-comar-navy',
          desc: 'text-comar-gray-text',
          cardBg: 'bg-emerald-50/60 border-emerald-200/60',
          badge: 'bg-emerald-100 text-emerald-700',
          badgeLabel: 'Terminé',
          checkIcon: true,
        };
      case 'in-progress':
        return {
          markerBg: 'bg-gradient-to-br from-comar-royal to-blue-600',
          markerBorder: 'border-blue-300',
          markerShadow: 'shadow-[0_0_24px_rgba(30,79,216,0.4)]',
          line: 'from-gray-200 to-gray-200',
          lineSolid: 'bg-gray-200',
          title: 'text-comar-royal',
          desc: 'text-comar-gray-text',
          cardBg: 'bg-blue-50/70 border-comar-royal/25 ring-1 ring-comar-royal/10',
          badge: 'bg-comar-royal/10 text-comar-royal',
          badgeLabel: 'En cours',
          pulseRing: true,
        };
      case 'rejected':
        return {
          markerBg: 'bg-gradient-to-br from-red-400 to-red-600',
          markerBorder: 'border-red-300',
          markerShadow: 'shadow-[0_0_20px_rgba(212,43,43,0.3)]',
          line: 'from-gray-200 to-gray-200',
          lineSolid: 'bg-gray-200',
          title: 'text-comar-red',
          desc: 'text-red-500',
          cardBg: 'bg-red-50/70 border-red-200/60 ring-1 ring-red-200/30',
          badge: 'bg-red-100 text-red-700',
          badgeLabel: 'Rejeté',
        };
      case 'cancelled':
        return {
          markerBg: 'bg-gradient-to-br from-red-500 to-rose-700',
          markerBorder: 'border-red-400',
          markerShadow: 'shadow-[0_0_22px_rgba(239,68,68,0.35)]',
          line: 'from-gray-200 to-gray-200',
          lineSolid: 'bg-gray-200',
          title: 'text-red-700',
          desc: 'text-red-600',
          cardBg: 'bg-red-50/70 border-red-200/70 ring-1 ring-red-200/40',
          badge: 'bg-red-100 text-red-700',
          badgeLabel: 'Annulé',
        };
      default: // pending
        return {
          markerBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
          markerBorder: 'border-gray-200',
          markerShadow: '',
          line: 'from-gray-200 to-gray-200',
          lineSolid: 'bg-gray-200',
          title: 'text-gray-400',
          desc: 'text-gray-400',
          cardBg: 'bg-gray-50/40 border-gray-100',
          badge: 'bg-gray-100 text-gray-400',
          badgeLabel: 'En attente',
          dimmed: true,
        };
    }
  };

  return (
    <div className="relative">
      {timeline.map((event, index) => {
        const config = getStatusConfig(event.status);
        const isLast = index === timeline.length - 1;
        const animDelay = `${index * 150}ms`;

        return (
          <div
            key={index}
            className="flex gap-5 sm:gap-7 relative animate-fade-in"
            style={{ animationDelay: animDelay, animationFillMode: 'backwards' }}
          >
            {/* ─── Marker Column ─── */}
            <div className="flex flex-col items-center relative z-10">
              {/* Pulse ring for in-progress */}
              {config.pulseRing && (
                <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-comar-royal/15 animate-ping" style={{ animationDuration: '2s' }} />
              )}
              {/* Main marker */}
              <div
                className={`
                  relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-lg
                  transition-all duration-500 shrink-0
                  ${config.markerBg} ${config.markerBorder} ${config.markerShadow}
                `}
              >
                {config.checkIcon ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-base sm:text-lg ${config.dimmed ? 'grayscale opacity-50' : ''}`}>
                    {event.icon || ''}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="w-0.5 flex-1 min-h-[48px] relative">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-b ${config.line}`} />
                </div>
              )}
            </div>

            {/* ─── Content Card ─── */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <div
                className={`
                  rounded-2xl p-4 sm:p-5 border backdrop-blur-sm
                  transition-all duration-300 hover:shadow-md
                  ${config.cardBg}
                `}
              >
                {/* Top row: title + badge + date */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className={`text-sm sm:text-base font-bold ${config.title}`}>
                      {event.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                      {config.pulseRing && (
                        <span className="w-1.5 h-1.5 rounded-full bg-comar-royal animate-pulse" />
                      )}
                      {config.badgeLabel}
                    </span>
                  </div>

                  {/* Date / time chips */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {event.date !== 'À venir' ? (
                      <>
                        <span className="inline-flex items-center gap-1 bg-white/80 border border-gray-200/60 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-comar-navy shadow-sm">
                          <svg className="w-3 h-3 text-comar-gray-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {event.date}
                        </span>
                        {event.time && (
                          <span className="inline-flex items-center gap-1 bg-white/80 border border-gray-200/60 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-comar-navy shadow-sm">
                            <svg className="w-3 h-3 text-comar-gray-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {event.time}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 italic text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        À venir
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className={`text-xs sm:text-sm leading-relaxed ${config.desc}`}>
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;
