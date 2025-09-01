const Paciente = require('../models/Paciente');

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const created = await Paciente.create(data);
    return res.status(201).json({ ok: true, data: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ ok: false, error: 'RUT ya existe' });
    }
    return res.status(400).json({ ok: false, error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const {
      q,
      sexo,
      rangoEdad,        // ej: "18-40" o "66-+"
      fechaDesde,       // ISO date
      fechaHasta,       // ISO date
      ordenar           // 'nombre-asc'|'nombre-desc'|'edad-asc'|'edad-desc'|'fechaIngreso-desc'|'fechaIngreso-asc'
    } = req.query;

    const filter = {};

    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), 'i');
      filter.$or = [{ nombre: rx }, { rut: rx }, { enfermedad: rx }];
    }

    if (sexo) {
      filter.sexo = sexo;
    }

    if (rangoEdad) {
      const [minStr, maxStr] = rangoEdad.split('-');
      const min = Number(minStr);
      const edadCond = {};
      if (!Number.isNaN(min)) edadCond.$gte = min;
      if (maxStr && maxStr !== '+') {
        const max = Number(maxStr);
        if (!Number.isNaN(max)) edadCond.$lte = max;
      }
      if (Object.keys(edadCond).length) filter.edad = edadCond;
    }

    if (fechaDesde || fechaHasta) {
      filter.fechaIngreso = {};
      if (fechaDesde) filter.fechaIngreso.$gte = new Date(fechaDesde);
      if (fechaHasta) {
        const fin = new Date(fechaHasta);
        // incluir todo el día de fechaHasta
        fin.setHours(23, 59, 59, 999);
        filter.fechaIngreso.$lte = fin;
      }
    }

    let sort = { createdAt: -1 };
    switch (ordenar) {
      case 'nombre-asc': sort = { nombre: 1 }; break;
      case 'nombre-desc': sort = { nombre: -1 }; break;
      case 'edad-asc': sort = { edad: 1 }; break;
      case 'edad-desc': sort = { edad: -1 }; break;
      case 'fechaIngreso-asc': sort = { fechaIngreso: 1 }; break;
      case 'fechaIngreso-desc': sort = { fechaIngreso: -1 }; break;
      default: break;
    }

    const items = await Paciente.find(filter).sort(sort).lean();
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

exports.getById = async (req, res) => {
  const item = await Paciente.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ ok: false, error: 'No encontrado' });
  res.json({ ok: true, data: item });
};

exports.update = async (req, res) => {
  try {
    const updated = await Paciente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ ok: false, error: 'No encontrado' });
    res.json({ ok: true, data: updated });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
};

// Export correcto
module.exports = {
  create: exports.create,
  list: exports.list,
  getById: exports.getById,
  update: exports.update,
};
