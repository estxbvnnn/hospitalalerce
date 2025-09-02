const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// appApi es la aplicación/routers definidos en ./app/server (las rutas existentes)
const appApi = require('./app/server');
const { connect } = require('./app/config/db');

const PORT = process.env.PORT || 3000;
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';
const ALLOW_ALL_ORIGINS = (process.env.ALLOW_ALL_ORIGINS === 'true') || (process.env.NODE_ENV !== 'production');

// Creamos la app "root" donde aplicaremos middlewares globales antes de montar el API existente
const app = express();

// parseo de bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permitir orígenes de dev comunes y FRONTEND_DEV_URL
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

// Middleware que asegura que si un controlador termina sin cuerpo, se envíe '{}' para evitar errores de .json()
app.use((req, res, next) => {
	const originalSend = res.send;
	res.send = function (body) {
		// si no se envió body o body está vacío, responder con objeto JSON vacío
		if (body === undefined || body === null || body === '') {
			// establecer Content-Type si no lo hay
			if (!res.get('Content-Type')) res.set('Content-Type', 'application/json; charset=utf-8');
			return originalSend.call(this, JSON.stringify({}));
		}
		return originalSend.call(this, body);
	};
	next();
});

// logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// endpoints de prueba útiles
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.post('/api/test-create', (req, res) => res.json({ ok: true, received: req.body }));

// --- NUEVA RUTA: obtener todos los pacientes directamente desde MongoDB ---
// Se registra antes de montar appApi para asegurar listado funcional.
app.get('/api/pacientes', async (req, res) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DBNAME || 'hospitalelalerce';
  let client;
  try {
    client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);

    // Intentar colección 'pacientes'
    let collection = db.collection('pacientes');
    let docs = await collection.find({}).toArray();

    // Fallback: si no hay documentos, intentar 'paciente' (posible nombre distinto)
    if (!docs || docs.length === 0) {
      console.log('[server] /api/pacientes: no hay docs en "pacientes", probando "paciente"');
      collection = db.collection('paciente');
      docs = await collection.find({}).toArray();
    }

    console.log(`[server] /api/pacientes: encontrados ${docs.length} documentos en "${collection.collectionName}"`);

    const mapped = docs.map(d => {
      const {_id, ...rest} = d;
      return Object.assign({}, rest, { _id: _id ? _id.toString() : undefined });
    });

    // Devuelve la forma que espera el frontend React: { ok: true, data: [...] }
    return res.json({ ok: true, data: mapped });
  } catch (err) {
    console.error('Error leyendo pacientes desde MongoDB directo:', err);
    return res.status(500).json({ ok: false, error: 'Error leyendo pacientes desde DB', details: err.message || err });
  } finally {
    if (client) await client.close();
  }
});

// --- NUEVA RUTA: búsqueda avanzada por sexo, fechaIngreso y enfermedad ---
// Inserta este bloque antes de: app.use('/', appApi);
app.get('/api/pacientes/search', async (req, res) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DBNAME || 'hospitalelalerce';
  const { sexo, fechaIngreso, enfermedad } = req.query;

  // construir query
  const query = {};
  if (sexo && typeof sexo === 'string' && sexo.trim()) {
    query.sexo = sexo.trim();
  }

  if (enfermedad && typeof enfermedad === 'string' && enfermedad.trim()) {
    // búsqueda texto case-insensitive en campo enfermedad
    query.enfermedad = { $regex: new RegExp(enfermedad.trim(), 'i') };
  }

  if (fechaIngreso && typeof fechaIngreso === 'string' && fechaIngreso.trim()) {
    // aceptar formato YYYY-MM-DD o ISO; filtrar por rango del día
    const d = new Date(fechaIngreso);
    if (isNaN(d.getTime())) {
      return res.status(422).json({ error: 'fechaIngreso inválida. Use formato YYYY-MM-DD o ISO.' });
    }
    // rango desde inicio del día hasta fin del día (UTC)
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
    // Si la DB guarda fecha como string ISO, intentar comparar como Date y como string
    query.$or = [
      { fechaIngreso: { $gte: start.toISOString(), $lte: end.toISOString() } },
      { fechaIngreso: { $gte: start, $lte: end } },
      // si fechaIngreso en DB es solo fecha YYYY-MM-DD
      { fechaIngreso: { $regex: new RegExp(`^${fechaIngreso}`) } }
    ];
  }

  let client;
  try {
    client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);

    // probar colección 'pacientes' primero, fallback a 'paciente'
    let collection = db.collection('pacientes');
    let exists = await collection.countDocuments({});
    if (exists === 0) {
      collection = db.collection('paciente');
    }

    const docs = await collection.find(query).toArray();
    const mapped = docs.map(d => {
      const { _id, ...rest } = d;
      return Object.assign({}, rest, { _id: _id ? _id.toString() : undefined });
    });

    console.log(`[server] /api/pacientes/search => query: ${JSON.stringify(query)}, result: ${mapped.length}`);
    return res.json(mapped);
  } catch (err) {
    console.error('[server] Error en /api/pacientes/search:', err);
    return res.status(500).json({ error: 'Error buscando pacientes', details: err.message || err });
  } finally {
    if (client) await client.close();
  }
});

// -- LOG: mostrar body de POST /api/pacientes entrantes (antes de montar appApi)
app.post('/api/pacientes', (req, res, next) => {
  try {
    console.log('[server] POST /api/pacientes body:', JSON.stringify(req.body));
  } catch (e) {
    console.log('[server] POST /api/pacientes body (unserializable)');
  }
  next(); // dejar que la ruta real la procese (en appApi) si existe
});

// -- DEBUG: listar colecciones y conteos en la BD
app.get('/api/debug/collections', async (req, res) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DBNAME || 'hospitalelalerce';
  let client;
  try {
    client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const cols = await db.listCollections().toArray();
    const results = [];
    for (const c of cols) {
      const coll = db.collection(c.name);
      const count = await coll.countDocuments({});
      results.push({ name: c.name, count });
    }
    res.json({ db: dbName, collections: results });
  } catch (err) {
    console.error('[server] /api/debug/collections error:', err);
    res.status(500).json({ error: 'Error leyendo colecciones', details: err.message || err });
  } finally {
    if (client) await client.close();
  }
});

// -- AGGREGADOR: devuelve todos los pacientes buscando en varias colecciones posibles
app.get('/api/pacientes/all', async (req, res) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DBNAME || 'hospitalelalerce';
  const candidateNames = ['pacientes', 'paciente', 'patients', 'Patients'];
  let client;
  try {
    client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const found = [];
    for (const name of candidateNames) {
      const exists = (await db.listCollections({ name }).toArray()).length > 0;
      if (!exists) continue;
      const docs = await db.collection(name).find({}).toArray();
      for (const d of docs) {
        const { _id, ...rest } = d;
        found.push(Object.assign({}, rest, { _id: _id ? _id.toString() : undefined, _collection: name }));
      }
    }
    console.log(`[server] /api/pacientes/all => total encontrados: ${found.length}`);
    return res.json(found);
  } catch (err) {
    console.error('[server] /api/pacientes/all error:', err);
    return res.status(500).json({ error: 'Error leyendo pacientes (all)', details: err.message || err });
  } finally {
    if (client) await client.close();
  }
});

// Montamos la app/routers existente (que define /api/pacientes, etc.)
app.use('/', appApi);

// Si existe un build de cliente en client/dist, servirlo (igual que antes)
(async () => {
	try {
		const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalelalerce';
		await connect(uri);
		console.log('Conexión exitosa a la base de datos');

		const clientDistRoot = path.join(__dirname, 'client', 'dist');
		if (fs.existsSync(clientDistRoot)) {
			const subdirs = fs.readdirSync(clientDistRoot, { withFileTypes: true })
				.filter(d => d.isDirectory())
				.map(d => path.join(clientDistRoot, d.name));
			if (subdirs.length > 0) {
				const staticPath = subdirs[0]; 
				app.use(express.static(staticPath));
				app.get('*', (req, res) => {
					res.sendFile(path.join(staticPath, 'index.html'));
				});
				console.log('Sirviendo frontend Angular desde:', staticPath);
			}
		}

		app.listen(PORT, () => {
			console.log(`Servidor corriendo en el puerto ${PORT}`);
			console.log(`Abre: http://localhost:${PORT}`);
			console.log(`FRONTEND_DEV_URL: ${FRONTEND_DEV_URL}`);
		});
	} catch (err) {
		console.error('Error conectando a la base de datos:', err.message);
		process.exit(1);
	}
})();