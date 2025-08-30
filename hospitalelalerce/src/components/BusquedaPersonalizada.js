import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function BusquedaPersonalizada() {
  const [filters, setFilters] = useState({ sexo: '', fechaIngreso: '', enfermedad: '' });
  const [resultados, setResultados] = useState([]);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    // Build query string
    const params = new URLSearchParams(filters).toString();
    fetch(`/api/pacientes/busqueda?${params}`)
      .then(res => res.json())
      .then(data => setResultados(Array.isArray(data) ? data : []))
      .catch(() => setResultados([]));
  };

  return (
    <div>
      <input name="sexo" value={filters.sexo} onChange={handleChange} placeholder="Sexo" />
      <input name="fechaIngreso" value={filters.fechaIngreso} onChange={handleChange} type="date" />
      <input name="enfermedad" value={filters.enfermedad} onChange={handleChange} placeholder="Enfermedad" />
      <button onClick={handleSearch}>Buscar</button>
      <ul>
        {resultados.map(p => (
          <li key={p.rut}>
            {p.nombre} <Link to={`/detalle/${p.rut}`}>Ver</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BusquedaPersonalizada;
