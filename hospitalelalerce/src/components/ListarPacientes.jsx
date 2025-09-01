import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ListarPacientes.css';

export default function ListarPacientes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filters, setFilters] = useState({ q: '', edad: '', sexo: '', ordenar: 'nombre-asc' });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pacientes');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al listar');
        const mapped = (json.data || []).map(p => ({
          id: p._id,
          nombre: p.nombre,
          rut: p.rut,
          edad: p.edad,
          sexo: p.sexo || '',
          enfermedad: p.enfermedad || '',
        }));
        setRows(mapped);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const onClear = () => setFilters({ q: '', edad: '', sexo: '', ordenar: 'nombre-asc' });
  const onSubmit = (e) => e.preventDefault();

  const filtered = useMemo(() => {
    return rows
      .filter(r => {
        const q = filters.q.trim().toLowerCase();
        const matchQ = q
          ? (r.nombre || '').toLowerCase().includes(q)
            || (r.rut || '').toLowerCase().includes(q)
            || (r.enfermedad || '').toLowerCase().includes(q)
          : true;
        const matchSexo = filters.sexo ? r.sexo === filters.sexo : true;
        const matchEdad = filters.edad
          ? (() => {
              const [min, max] = filters.edad.split('-');
              const n = Number(r.edad || 0);
              if (max === '+') return n >= Number(min);
              return n >= Number(min) && n <= Number(max);
            })()
          : true;
        return matchQ && matchSexo && matchEdad;
      })
      .sort((a, b) => {
        switch (filters.ordenar) {
          case 'nombre-asc': return a.nombre.localeCompare(b.nombre);
          case 'nombre-desc': return b.nombre.localeCompare(a.nombre);
          case 'edad-asc': return (a.edad || 0) - (b.edad || 0);
          case 'edad-desc': return (b.edad || 0) - (a.edad || 0);
          default: return 0;
        }
      });
  }, [rows, filters]);

  return (
    <main className="view-listar">
      <h1 className="title">Listado de Pacientes</h1>
      <p className="subtitle">Gestiona y filtra los pacientes registrados.</p>

      <div className="actions backRow">
        <Link className="btn btn--ghost" to="/">← Volver al inicio</Link>
        <Link className="btn btn--new" to="/nuevo">+ Nuevo</Link>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="field">
            <label>Búsqueda</label>
            <input
              name="q"
              value={filters.q}
              onChange={onChange}
              placeholder="Nombre, RUT o enfermedad"
              inputMode="search"
            />
          </div>
          <div className="field">
            <label>Rango de edad</label>
            <select name="edad" value={filters.edad} onChange={onChange}>
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
            <label>Orden</label>
            <select name="ordenar" value={filters.ordenar} onChange={onChange}>
              <option value="nombre-asc">Nombre (A-Z)</option>
              <option value="nombre-desc">Nombre (Z-A)</option>
              <option value="edad-asc">Edad (menor a mayor)</option>
              <option value="edad-desc">Edad (mayor a menor)</option>
            </select>
          </div>
        </div>
        <div className="actions formActions">
          <button className="btn btn--apply" type="submit">Aplicar filtros</button>
          <button type="button" className="btn btn--clear" onClick={onClear}>Limpiar</button>
        </div>
      </form>

      <div className="listar__summary">
        {loading ? 'Cargando...' : err ? <span className="error">{err}</span> : <span>Total: {filtered.length}</span>}
      </div>

      <div className="tableWrap">
        <table className="table table--compact">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Enfermedad</th>
              <th style={{ width: 220 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !err && filtered.map(r => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.rut}</td>
                <td>{r.edad}</td>
                <td>{r.sexo}</td>
                <td>{r.enfermedad}</td>
                <td className="rowActions">
                  <Link className="btn btn--ghost" to={`/detalle/${r.id}`}>Detalle</Link>
                  <Link className="btn btn--ghost" to={`/actualizar/${r.id}`}>Editar</Link>
                </td>
              </tr>
            ))}
            {!loading && !err && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="emptyCell">Sin resultados para los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}