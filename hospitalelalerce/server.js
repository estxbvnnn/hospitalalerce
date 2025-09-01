const app = require('./app/server');
const { connect } = require('./app/config/db');
const PORT = process.env.PORT || 3000;
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';

(async () => {
	try {
		const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalelalerce';
		await connect(uri);
		console.log('Conexión exitosa a la base de datos');

		app.listen(PORT, () => {
			console.log(`Servidor corriendo en el puerto ${PORT}`);
			console.log(`API health: http://localhost:${PORT}/api/health`);
			console.log(`Frontend dev (si no hay build): ${FRONTEND_DEV_URL}`);
			console.log(`Abre: http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error('Error conectando a la base de datos:', err.message);
		process.exit(1);
	}
})();