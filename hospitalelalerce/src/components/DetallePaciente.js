import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function DetallePaciente() {
  const { rut } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/pacientes/${rut}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar');
        return res.json();
      })
      .then(data => setPaciente(data))
      .catch(() => setPaciente(null))
      .finally(() => setLoading(false));
  }, [rut]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar (inhabilitar) este paciente?')) return;
    try {
      const res = await fetch(`/api/pacientes/${rut}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.text();
        alert('Error al eliminar: ' + err);
        return;
      }
      navigate('/listar');
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!paciente) return <div>Paciente no encontrado.</div>;

  return (
    <div>
      <img src={paciente.fotoPersonal || '/placeholder.png'} alt={paciente.nombre} width={100} />
      <p>Nombre: {paciente.nombre}</p>
      <p>Edad: {paciente.edad}</p>
      <p>Sexo: {paciente.sexo}</p>
      <p>Enfermedad: {paciente.enfermedad}</p>
      <p>Fecha Ingreso: {paciente.fechaIngreso ? paciente.fechaIngreso.slice(0,10) : ''}</p>
      <p>Revisado: {paciente.revisado ? 'Sí' : 'No'}</p>
      <Link to={`/actualizar/${rut}`}>Actualizar</Link>
      <button onClick={handleDelete}>Eliminar</button>
    </div>
  );
}

export default DetallePaciente;
