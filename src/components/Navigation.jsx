import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

function Navigation({ clientInfo, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-comar-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-comar.png" alt="COMAR Assurances" className="h-9 w-auto drop-shadow-md rounded-xl" />
        </Link>

        {/* Menu Toggle Button (mobile) */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 group"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Navigation Menu */}
        <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-comar-navy md:bg-transparent border-t border-white/10 md:border-0 items-center gap-1 md:gap-2 p-4 md:p-0 z-40`}>
          <Link
            to="/home"
            className={`w-full md:w-auto text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/home')
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Tableau de Bord
          </Link>
          <Link
            to="/my-requests"
            className={`w-full md:w-auto text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/my-requests')
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Mes Demandes
          </Link>
          <Link
            to="/notifications"
            className={`w-full md:w-auto text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/notifications')
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="inline-flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex min-w-[20px] h-5 items-center justify-center rounded-full bg-comar-red text-white text-[11px] font-bold px-1.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          </Link>
          <Link
            to="/mon-compte"
            className={`w-full md:w-auto text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/mon-compte')
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Mon Compte
          </Link>
          <Link
            to="/soumettre-dossier"
            className={`w-full md:w-auto text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive('/soumettre-dossier') || isActive('/create-request')
                ? 'bg-comar-royal text-white shadow-md'
                : 'bg-comar-royal/90 text-white hover:bg-comar-royal hover:shadow-md'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            + Soumettre une Demande
          </Link>
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center ml-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>

        {/* Mobile logout */}
        {menuOpen && (
          <div className="md:hidden absolute top-[calc(100%+theme(spacing.1))] right-4 z-50">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white border border-white/20 transition-all duration-200 hover:bg-white/20"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
