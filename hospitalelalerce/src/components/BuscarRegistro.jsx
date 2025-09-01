import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BuscarRegistro.css';

export default function BuscarRegistro() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [results, setResults] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/pacientes');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al buscar');
      const lower = q.trim().toLowerCase();
      const filtered = (json.data || []).filter(p =>
        (p.nombre || '').toLowerCase().includes(lower) ||
        (p.rut || '').toLowerCase().includes(lower) ||
        (p.enfermedad || '').toLowerCase().includes(lower)
      );
      setResults(filtered.map(p => ({
        id: p._id,
        nombre: p.nombre,
        rut: p.rut,
        edad: p.edad,
        sexo: p.sexo,
        enfermedad: p.enfermedad,
      })));
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setQ('');
    setResults([]);
    setErr('');
  };

  return (
    <main className="view-buscar">
      <h1 className="title">Buscar Paciente</h1>
      <p className="subtitle">Encuentra pacientes por nombre, RUT o enfermedad.</p>

      <div className="actions backRow">
        <Link className="btn btn--ghost" to="/">← Volver al inicio</Link>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="field">
            <label>Término de búsqueda</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: Juan, 11.111.111-1 o 'Diabetes'"
              inputMode="search"
            />
          </div>
        </div>
        <div className="actions formActions">
          <button className="btn btn--apply" type="submit" disabled={!q.trim() || loading}>
            {loading ? 'Buscando…' : 'Aplicar filtros'}
          </button>
          <button type="button" className="btn btn--clear" onClick={onClear}>Limpiar</button>
        </div>
      </form>

      <div className="buscar__summary">
        {loading ? 'Cargando…' : err ? <span className="error">{err}</span> : (
          results.length ? <span>Resultados: {results.length}</span> : <span>Sin resultados.</span>
        )}
      </div>

      <div className="tableWrap" hidden={!results.length}>
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
            {results.map(r => (
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
          </tbody>
        </table>
      </div>
    </main>
  );
}
