const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const ctrl = require('../controllers/pacienteController');

const router = Router();

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(422).json({ ok: false, errors: result.array() });
};

// Crear paciente
router.post(
  '/pacientes',
  [
    body('rut').isString().trim().notEmpty(),
    body('nombre').isString().trim().notEmpty(),
    body('edad').isInt({ min: 0 }).toInt(),
    body('sexo').isString().isIn(['M', 'F', 'Otro']),
    body('fotoPersonal').optional().isString(),
    body('fechaIngreso').isISO8601().toDate(),
    body('enfermedad').isString().trim().notEmpty(),
    body('revisado').isBoolean().toBoolean()
  ],
  validate,
  ctrl.create
);

// Listar (con filtros por querystring)
router.get(
  '/pacientes',
  [
    query('q').optional().isString().trim(),
    query('sexo').optional().isIn(['M', 'F', 'Otro']),
    query('rangoEdad').optional().matches(/^\d{1,3}-(\d{1,3}|\+)$/),
    query('fechaDesde').optional().isISO8601(),
    query('fechaHasta').optional().isISO8601(),
    query('ordenar').optional().isIn([
      'nombre-asc', 'nombre-desc',
      'edad-asc', 'edad-desc',
      'fechaIngreso-asc', 'fechaIngreso-desc'
    ])
  ],
  validate,
  ctrl.list
);

// Obtener por id
router.get('/pacientes/:id', [param('id').isMongoId()], validate, ctrl.getById);

// Actualizar
router.put(
  '/pacientes/:id',
  [
    param('id').isMongoId(),
    body('rut').optional().isString().trim(),
    body('nombre').optional().isString().trim(),
    body('edad').optional().isInt({ min: 0 }).toInt(),
    body('sexo').optional().isString().isIn(['M', 'F', 'Otro']),
    body('fotoPersonal').optional().isString(),
    body('fechaIngreso').optional().isISO8601().toDate(),
    body('enfermedad').optional().isString().trim(),
    body('revisado').optional().isBoolean().toBoolean()
  ],
  validate,
  ctrl.update
);

module.exports = router;
