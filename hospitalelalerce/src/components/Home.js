import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Hospital El Alerce</h1>
      <ul>
        <li><Link to="/nuevo">Agregar Paciente</Link></li>
        <li><Link to="/listar">Listar Pacientes</Link></li>
        <li><Link to="/buscar">Buscar Paciente</Link></li>
        <li><Link to="/busqueda">Busqueda Personalizada</Link></li>
      </ul>
    </div>
  );
}

export default Home;
