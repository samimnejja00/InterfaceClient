import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import MyAccount from './pages/MyAccount';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SoumettreDossier from './pages/SoumettreDossier';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-comar-gray-bg">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-comar-navy mb-2">PrestaTrack</h1>
          <p className="text-comar-gray-text mb-4">Chargement...</p>
          <div className="w-10 h-10 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto" />
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
    clientNumber: client.police_number || client.cin,
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
        <Route path="/mon-compte" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <MyAccount />
          </ProtectedRoute>
        } />
        <Route path="/request-details/:requestId" element={
          <ProtectedRoute>
            <Navigation clientInfo={clientInfo} onLogout={logout} />
            <RequestDetails clientInfo={clientInfo} />
          </ProtectedRoute>
        } />
        

        {/* Redirect old signup to register */}
        <Route path="/signup" element={<Navigate to="/register" replace />} />
      </Routes>
      {isAuthenticated && <Chatbot />}
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
