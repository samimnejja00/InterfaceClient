require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clientRoutes = require('./routes/clients');
const dossierRoutes = require('./routes/dossiers');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000', // React dev server
  credentials: true,
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/clients', clientRoutes);
app.use('/api/dossiers', dossierRoutes);

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
app.listen(PORT, () => {
  console.log(`\n🚀 PrestaTrack API is running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
