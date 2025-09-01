import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ActualizarRegistro.css';

export default function ActualizarRegistro() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/pacientes/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'No se pudo cargar el paciente');
        const p = json.data;
        setForm({
          rut: p.rut || '',
          nombre: p.nombre || '',
          edad: p.edad ?? '',
          sexo: p.sexo || 'M',
          fotoPersonal: p.fotoPersonal || '',
          fechaIngreso: p.fechaIngreso ? new Date(p.fechaIngreso).toISOString().slice(0, 10) : '',
          enfermedad: p.enfermedad || '',
          revisado: !!p.revisado
        });
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        edad: Number(form.edad),
        // fechaIngreso (YYYY-MM-DD) será parseada por el backend con express-validator
      };
      const res = await fetch(`/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'No se pudo actualizar');
      alert('Paciente actualizado correctamente');
      navigate(`/detalle/${id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="view-actualizar"><p>Cargando...</p></main>;

  return (
    <main className="view-actualizar">
      <h1 className="title">Actualizar Registro</h1>

      <div className="actions" style={{ margin: '6px 0 8px' }}>
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
          <div className="field field--full">
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
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          <Link className="btn btn--ghost" to={`/detalle/${id}`}>Cancelar</Link>
        </div>
      </form>
    </main>
  );
}
