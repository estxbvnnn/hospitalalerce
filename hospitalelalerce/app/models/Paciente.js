const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema(
  {
    rut: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    edad: { type: Number, required: true, min: 0 },
    sexo: { type: String, required: true, enum: ['M', 'F', 'Otro'] },
    fotoPersonal: { type: String, default: '' },
    fechaIngreso: { type: Date, required: true },
    enfermedad: { type: String, required: true, trim: true },
    revisado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PacienteSchema.index({ rut: 1 }, { unique: true });

module.exports = mongoose.model('Paciente', PacienteSchema);
