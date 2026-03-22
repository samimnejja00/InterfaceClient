import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import RCDashboard from './pages/RCDashboard';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';
import './styles/App.css';

function AppContent() {
  const { user, profile, loading, error, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1>PrestaTrack</h1>
          <p>Loading your application...</p>
          <div style={{
            marginTop: '2rem',
            fontSize: '2rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
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

  if (error && !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px'
      }}>
        <div style={{
          width: 'min(720px, 100%)',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          padding: '24px'
        }}>
          <h1 style={{ marginBottom: '8px' }}>PrestaTrack</h1>
          <p style={{ marginBottom: '16px', color: '#475569' }}>
            The app can’t start because configuration is missing.
          </p>
          <div style={{
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.5,
            overflowX: 'auto'
          }}>
            {error}
          </div>
          <div style={{ marginTop: '16px', color: '#475569' }}>
            <p style={{ marginBottom: '8px' }}><strong>Fix:</strong></p>
            <ol style={{ paddingLeft: '18px', margin: 0 }}>
              <li>Put your Supabase Project URL + anon key in <code>.env</code></li>
              <li>Stop the dev server and run <code>npm start</code> again</li>
              <li>Reload the page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const clientInfo = profile ? {
    id: user?.id,
    name: profile?.name,
    email: profile?.email,
    clientNumber: profile?.client_number,
  } : null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<><Navigation clientInfo={clientInfo} onLogout={logout} /><Dashboard clientInfo={clientInfo} /></>} />
        <Route path="/create-request" element={<><Navigation clientInfo={clientInfo} onLogout={logout} /><CreateRequest clientInfo={clientInfo} /></>} />
        <Route path="/my-requests" element={<><Navigation clientInfo={clientInfo} onLogout={logout} /><MyRequests clientInfo={clientInfo} /></>} />
        <Route path="/request-details/:requestId" element={<><Navigation clientInfo={clientInfo} onLogout={logout} /><RequestDetails clientInfo={clientInfo} /></>} />
        <Route path="/rc-dashboard" element={<><Navigation clientInfo={clientInfo} onLogout={logout} /><RCDashboard /></>} />
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
