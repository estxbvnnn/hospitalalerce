import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetallePaciente.css';

export default function DetallePaciente() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    // TODO: GET /api/pacientes/:id
    setData({ id, nombre: 'Paciente Demo', rut: '11.111.111-1', edad: 30 });
  }, [id]);

  if (!data) return null;

  return (
    <main className="view-detalle">
      <h1 className="title">Detalle del Paciente</h1>

      <div className="actions" style={{ margin: '6px 0 8px' }}>
        <Link className="btn btn--ghost" to="/">← Volver al inicio</Link>
      </div>

      <div className="detail">
        <div className="detailGrid">
          <div>
            <strong>Nombre</strong>
            <div>{data.nombre}</div>
          </div>
          <div>
            <strong>RUT</strong>
            <div>{data.rut}</div>
          </div>
          <div>
            <strong>Edad</strong>
            <div>{data.edad}</div>
          </div>
        </div>
        <div className="detailActions">
          <Link className="btn btn--ghost" to={`/actualizar/${id}`}>Editar</Link>
          <a className="btn" href="/listar">Volver al listado</a>
        </div>
      </div>
    </main>
  );
}
