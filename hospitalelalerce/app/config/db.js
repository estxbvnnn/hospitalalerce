const mongoose = require('mongoose');

// No conectar automáticamente aquí para evitar dobles conexiones
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));

module.exports = {
	connect: (uri) => mongoose.connect(uri),
	connection: db,
};