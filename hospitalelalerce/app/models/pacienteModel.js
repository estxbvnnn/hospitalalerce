const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    rut: { type: String, required: true },
    nombre: { type: String, required: true },
    edad: { type: Number, required: true },
    sexo: { type: String, required: true },
    fotoPersonal: { type: String },
    fechaIngreso: { type: Date, default: Date.now },
    enfermedad: { type: String, required: true },
    revisado: { type: Boolean, default: false }
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

// Operaciones CRUD
const crearPaciente = async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        res.status(201).json({ mensaje: 'Paciente creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.status(200).json(pacientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarPaciente = async (req, res) => {
    try {
        await Paciente.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ mensaje: 'Paciente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarPaciente = async (req, res) => {
    try {
        await Paciente.findByIdAndDelete(req.params.id);
        res.status(200).json({ mensaje: 'Paciente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    Paciente,
    crearPaciente,
    obtenerPacientes,
    actualizarPaciente,
    eliminarPaciente,
};