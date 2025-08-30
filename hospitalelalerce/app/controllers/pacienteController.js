const Paciente = require('../models/pacienteModel');

const pacienteController = {
    async crearPaciente(req, res) {
        try {
            const nuevoPaciente = new Paciente(req.body);
            await nuevoPaciente.save();
            res.status(201).json({ mensaje: 'Paciente creado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async obtenerPacientes(req, res) {
        try {
            const pacientes = await Paciente.find();
            res.status(200).json(pacientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async actualizarPaciente(req, res) {
        try {
            await Paciente.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ mensaje: 'Paciente actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async eliminarPaciente(req, res) {
        try {
            await Paciente.findByIdAndDelete(req.params.id);
            res.status(200).json({ mensaje: 'Paciente eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = pacienteController;
