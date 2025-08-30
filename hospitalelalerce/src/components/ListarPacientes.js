import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ListarPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch patients from backend
    fetch('/api/pacientes')
      .then(res => res.json())
      .then(data => {
        setPacientes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (pacientes.length === 0) return <div>No hay pacientes registrados.</div>;

  return (
    <div>
      <h2>Listado de Pacientes</h2>
      <ul>
        {pacientes.map(p => (
          <li key={p.rut}>
            <img src={p.fotoPersonal || '/placeholder.png'} alt={p.nombre} width={50} />
            {p.nombre}
            <Link to={`/detalle/${p.rut}`}> Ver Detalle</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListarPacientes;
