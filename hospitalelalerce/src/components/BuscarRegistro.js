import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function BuscarRegistro() {
  const [rut, setRut] = useState('');
  const [paciente, setPaciente] = useState(null);

  const handleSearch = async () => {
    if (!rut.trim()) {
      alert('Ingrese un RUT para buscar.');
      return;
    }
    try {
      const res = await fetch(`/api/pacientes/${rut}`);
      if (res.status === 404) {
        alert('Paciente no encontrado.');
        setPaciente(null);
        return;
      }
      if (!res.ok) {
        const err = await res.text();
        alert('Error: ' + err);
        setPaciente(null);
        return;
      }
      const data = await res.json();
      setPaciente(data);
    } catch (error) {
      alert('Error de conexión: ' + error.message);
      setPaciente(null);
    }
  };

  return (
    <div>
      <input value={rut} onChange={e => setRut(e.target.value)} placeholder="RUT" />
      <button onClick={handleSearch}>Buscar</button>
      {paciente && (
        <div>
          <p>{paciente.nombre}</p>
          <Link to={`/detalle/${paciente.rut}`}>Ver Detalle</Link>
        </div>
      )}
    </div>
  );
}

export default BuscarRegistro;
