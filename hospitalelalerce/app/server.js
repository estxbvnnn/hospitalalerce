const express = require('express');
const mongoose = require('mongoose');
const pacienteRoutes = require('./app/routes/pacienteRoutes');
const db = require('./config/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Rutas
app.use('/api', pacienteRoutes);

// Conexi�n a la base de datos
db.once('open', () => {
    console.log('Conexi�n exitosa a la base de datos');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});
