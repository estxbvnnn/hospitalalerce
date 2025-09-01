const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
let pacienteRoutes;
try {
	pacienteRoutes = require('./routes/pacienteRoutes');
} catch (err) {
	console.error('Error cargando rutas de paciente:', err.message);
}

const app = express();
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';

// Middleware
app.use(express.json());
app.use(cors());

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Rutas API reales (sin fallbacks que confundan)
if (pacienteRoutes) {
	app.use('/api', pacienteRoutes);
}

// Frontend (build o proxy dev)
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
	app.use(express.static(buildPath));
	app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
} else {
	const feProxy = createProxyMiddleware({ target: FRONTEND_DEV_URL, changeOrigin: true, ws: true, logLevel: 'warn' });
	app.use((req, res, next) => (req.path.startsWith('/api') ? next() : feProxy(req, res, next)));
}

// 404 API
app.use('/api', (req, res) => res.status(404).json({ error: 'Not Found', path: req.path }));

// Error handler
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;