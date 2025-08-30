const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { validarDatos } = require('../middleware/validationMiddleware');

router.post('/pacientes', validarDatos, pacienteController.crearPaciente);
router.get('/pacientes', pacienteController.obtenerPacientes);
router.get('/pacientes/:id', pacienteController.obtenerPacientePorId);
router.put('/pacientes/:id', validarDatos, pacienteController.actualizarPaciente);
router.delete('/pacientes/:id', pacienteController.eliminarPaciente);

module.exports = router;
