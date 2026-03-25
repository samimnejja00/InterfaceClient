import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import RCDashboard from './pages/RCDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SoumettreDossier from './pages/SoumettreDossier';
import Navigation from './components/Navigation';
import './styles/App.css';

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>PrestaTrack</h1>
          <p>Chargement...</p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '1rem auto'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { client, isAuthenticated, logout } = useAuth();

  const clientInfo = client ? {
    id: client.id,
    name: client.nom_complet,
    email: client.email,
    clientNumber: client.cin,
  } : null;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <Dashboard clientInfo={clientInfo} />
          </ProtectedRoute>
        } />
        <Route path="/create-request" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <CreateRequest clientInfo={clientInfo} />
          </ProtectedRoute>
        } />
        <Route path="/soumettre-dossier" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <SoumettreDossier />
          </ProtectedRoute>
        } />
        <Route path="/my-requests" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <MyRequests clientInfo={clientInfo} />
          </ProtectedRoute>
        } />
        <Route path="/request-details/:requestId" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <RequestDetails clientInfo={clientInfo} />
          </ProtectedRoute>
        } />
        <Route path="/rc-dashboard" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <RCDashboard />
          </ProtectedRoute>
        } />

        {/* Redirect old signup to register */}
        <Route path="/signup" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
