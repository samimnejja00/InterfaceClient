import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation({ clientInfo, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src="/logo-comar.png" alt="COMAR Assurances" className="navbar-logo-img" />
        </Link>

        {/* Menu Toggle Button */}
        <button
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link
            to="/home"
            className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Tableau de Bord
          </Link>
          <Link
            to="/my-requests"
            className={`nav-link ${isActive('/my-requests') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Mes Demandes
          </Link>
          <Link
            to="/create-request"
            className={`nav-link primary ${isActive('/create-request') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            + Nouvelle Demande
          </Link>
        </div>

        {/* User Menu */}
        <div className="user-menu">
          <div className="user-info">
            <button className="logout-button" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
