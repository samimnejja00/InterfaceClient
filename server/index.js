require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./config/supabase');
const clientRoutes = require('./routes/clients');
const dossierRoutes = require('./routes/dossiers');
const notificationRoutes = require('./routes/notifications');
const { startEmailNotifier } = require('./services/emailNotifier');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  }, // Accepte n'importe quel port sur localhost (ex: 3000, 3005)
  credentials: true,
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/clients', clientRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

// ─── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrestaTrack API is running' });
});

// ─── 404 handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée.' });
});

// ─── Error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
});

// ─── Start server ───────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 PrestaTrack API is running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

const stopEmailNotifier = startEmailNotifier({ supabase });

function shutdown(signal) {
  console.log(`\n[Server] ${signal} recu. Arret en cours...`);
  try {
    stopEmailNotifier();
  } catch (error) {
    console.error('[Server] Erreur arret EmailNotifier:', error.message);
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
