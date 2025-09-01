import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NuevoRegistro.css';

export default function NuevoRegistro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    edad: '',
    sexo: 'M',
    fotoPersonal: '',
    fechaIngreso: '',
    enfermedad: '',
    revisado: false
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        edad: Number(form.edad),
        // fechaIngreso viene como 'YYYY-MM-DD' y el backend la parsea a Date
      };
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear paciente');
      alert('Paciente creado correctamente');
      navigate('/listar');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="view-nuevo">
      <h1 className="title">Nuevo Registro</h1>
      <p className="subtitle">Ingresa los datos del paciente.</p>

      <div className="actions">
        <Link className="btn btn--ghost" to="">{/* ...existing code... */}</Link>
        {/* ...existing code... */}
      </div>
      <div className="actions" style={{ marginBottom: 8 }}>
        <Link className="btn btn--ghost" to="/">← Volver al inicio</Link>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="field">
            <label>RUT</label>
            <input name="rut" value={form.rut} onChange={onChange} placeholder="11.111.111-1" required />
          </div>
          <div className="field">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre completo" required />
          </div>
          <div className="field">
            <label>Edad</label>
            <input name="edad" type="number" min="0" value={form.edad} onChange={onChange} placeholder="Edad" required />
          </div>
          <div className="field">
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={onChange} required>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="field">
            <label>Foto (URL)</label>
            <input name="fotoPersonal" value={form.fotoPersonal} onChange={onChange} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Fecha de ingreso</label>
            <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={onChange} required />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Enfermedad</label>
            <input name="enfermedad" value={form.enfermedad} onChange={onChange} placeholder="Diagnóstico" required />
          </div>
          <div className="field">
            <label>
              <input type="checkbox" name="revisado" checked={form.revisado} onChange={onChange} />
              {' '}Revisado
            </label>
          </div>
        </div>

        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <a className="btn btn--ghost" href="/listar">Cancelar</a>
        </div>
      </form>
    </main>
  );
}
