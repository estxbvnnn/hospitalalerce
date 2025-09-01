import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BusquedaPersonalizada.css';

export default function BusquedaPersonalizada() {
  const [filters, setFilters] = useState({
    q: '',
    rangoEdad: '',
    sexo: '',
    fechaDesde: '',
    fechaHasta: '',
    ordenar: 'nombre-asc'
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, v);
    });
    return params.toString();
  };

  const onApply = async () => {
    setLoading(true);
    setErr('');
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/pacientes?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al filtrar pacientes');
      const mapped = (json.data || []).map(p => ({
        id: p._id,
        nombre: p.nombre,
        rut: p.rut,
        edad: p.edad,
        sexo: p.sexo,
        enfermedad: p.enfermedad,
        fechaIngreso: p.fechaIngreso ? new Date(p.fechaIngreso).toLocaleDateString() : ''
      }));
      setRows(mapped);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setFilters({ q: '', rangoEdad: '', sexo: '', fechaDesde: '', fechaHasta: '', ordenar: 'nombre-asc' });
    setRows([]);
    setErr('');
  };

  return (
    <main className="view-filtros">
      <h1 className="title">Búsqueda Personalizada</h1>
      <p className="subtitle">Combina múltiples criterios para filtrar pacientes guardados en la base de datos.</p>

      <div className="actions" style={{ margin: '6px 0 8px' }}>
        <Link className="btn btn--ghost" to="/">← Volver al inicio</Link>
      </div>

      <div className="filtersGrid card">
        <div className="field">
          <label>Texto (nombre, RUT o enfermedad)</label>
          <input name="q" value={filters.q} onChange={onChange} placeholder="Ej: Ana, 11.111.111-1 o Diabetes" />
        </div>
        <div className="field">
          <label>Rango de edad</label>
          <select name="rangoEdad" value={filters.rangoEdad} onChange={onChange}>
            <option value="">Todas</option>
            <option value="0-17">0 - 17</option>
            <option value="18-40">18 - 40</option>
            <option value="41-65">41 - 65</option>
            <option value="66-+">66+</option>
          </select>
        </div>
        <div className="field">
          <label>Sexo</label>
          <select name="sexo" value={filters.sexo} onChange={onChange}>
            <option value="">Todos</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="field">
          <label>Fecha desde</label>
          <input type="date" name="fechaDesde" value={filters.fechaDesde} onChange={onChange} />
        </div>
        <div className="field">
          <label>Fecha hasta</label>
          <input type="date" name="fechaHasta" value={filters.fechaHasta} onChange={onChange} />
        </div>
        <div className="field">
          <label>Orden</label>
          <select name="ordenar" value={filters.ordenar} onChange={onChange}>
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="edad-asc">Edad (menor a mayor)</option>
            <option value="edad-desc">Edad (mayor a menor)</option>
            <option value="fechaIngreso-asc">Ingreso (antiguos primero)</option>
            <option value="fechaIngreso-desc">Ingreso (recientes primero)</option>
          </select>
        </div>
      </div>

      <div className="actions" style={{ marginTop: 10 }}>
        <button className="btn btn--apply" onClick={onApply} disabled={loading}>
          {loading ? 'Filtrando…' : 'Aplicar filtros'}
        </button>
        <button className="btn btn--clear" onClick={onClear}>Limpiar</button>
      </div>

      <div className="listar__summary">
        {loading ? 'Cargando…' : err ? <span className="error">{err}</span> : rows.length ? <span>Total: {rows.length}</span> : <span>Sin resultados.</span>}
      </div>

      <div className="tableWrap" hidden={!rows.length}>
        <table className="table table--compact">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Enfermedad</th>
              <th>Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.rut}</td>
                <td>{r.edad}</td>
                <td>{r.sexo}</td>
                <td>{r.enfermedad}</td>
                <td>{r.fechaIngreso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
