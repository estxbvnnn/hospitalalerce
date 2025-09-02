const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// montar la app API existente desde la carpeta superior (../app)
let appApi;
try {
	appApi = require('../app/server'); // debe exportar un express app o router
} catch (err) {
	console.error('No se pudo cargar ../app/server:', err.message || err);
	// no hacemos throw, seguimos para que el servidor muestre errores pero no crashee
	appApi = null;
}
const { connect } = require('../app/config/db');

const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:4200';
const ALLOW_ALL_ORIGINS = (process.env.ALLOW_ALL_ORIGINS === 'true') || (process.env.NODE_ENV !== 'production');

const app = express();

// parseo de bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permitir orígenes de dev (ng serve) y FRONTEND_DEV_URL
const DEFAULT_DEV_ORIGINS = ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:5173'];
app.use(cors({
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (ALLOW_ALL_ORIGINS) return callback(null, true);
		if (FRONTEND_DEV_URL === '*') return callback(null, true);

		const allowed = FRONTEND_DEV_URL.split(',').map(s => s.trim()).filter(Boolean);
		DEFAULT_DEV_ORIGINS.forEach(u => { if (!allowed.includes(u)) allowed.push(u); });

		if (allowed.includes(origin)) return callback(null, true);

		console.warn('CORS blocked for origin:', origin, 'allowed:', allowed);
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	optionsSuccessStatus: 200
}));

// responder OPTIONS globalmente (preflight)
app.options('*', cors());

// Middleware que asegura respuesta JSON cuando controladores no devuelven body
app.use((req, res, next) => {
	const originalSend = res.send;
	res.send = function (body) {
		if (body === undefined || body === null || body === '') {
			if (!res.get('Content-Type')) res.set('Content-Type', 'application/json; charset=utf-8');
			return originalSend.call(this, JSON.stringify({}));
		}
		return originalSend.call(this, body);
	};
	next();
});

// logger simple
app.use((req, res, next) => {
  console.log(`[client/server] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// endpoints útiles locales (si la API real no está cargada todavía)
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString(), server: 'client-embedded' }));
app.post('/api/test-create', (req, res) => res.json({ ok: true, received: req.body }));

// montar la API real si se cargó correctamente
if (appApi) {
	app.use('/', appApi);
	console.log('[client/server] API montada desde ../app/server');
} else {
	console.warn('[client/server] ../app/server no disponible. Use /api/test-create para pruebas o ejecute el servidor principal.');
}

// servir build del cliente si existe (client/dist)
const clientDistRoot = path.join(__dirname, 'dist');
if (fs.existsSync(clientDistRoot)) {
  app.use(express.static(clientDistRoot));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistRoot, 'index.html'));
  });
}

// === Cambiado: arrancar el servidor inmediatamente y conectar a Mongo en segundo plano ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[client/server] Servidor embebido corriendo en puerto ${PORT}`);
  console.log(`[client/server] API (embedded): http://localhost:${PORT}/api  | Frontend dev: http://localhost:4200`);
});

// intentar conectar a Mongo en background (no bloquear arranque)
(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalelalerce';
    await connect(uri);
    console.log('[client/server] Conectado a MongoDB');
  } catch (err) {
    console.error('[client/server] Error al conectar a MongoDB (no se detiene el servidor):', err.message || err);
    // no exit; servidor seguirá respondiendo endpoints básicos (/api/ping, proxy)
  }
})();