const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://luisdaprado:h9S5xtldtFoD1sOA@cluster1.2m1dayb.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexi�n a la base de datos:'));
db.once('open', () => {
    console.log('Conexi�n exitosa a la base de datos');
});
