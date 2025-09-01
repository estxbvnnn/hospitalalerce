import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="home">
      <header className="home__header">
        <h1 className="home__title">Hospital El Alerce</h1>
        <p className="home__subtitle">Gestión de pacientes y consultas.</p>
      </header>

      <nav className="home__nav">
        <ul className="home__grid">
          <li>
            <Link to="/nuevo" className="card" aria-label="Nuevo paciente">
              <h3>Nuevo paciente</h3>
              <p>Registra un nuevo paciente en el sistema.</p>
              <span className="card__action">Continuar →</span>
            </Link>
          </li>
          <li>
            <Link to="/listar" className="card" aria-label="Listado de pacientes">
              <h3>Listado de pacientes</h3>
              <p>Explora el listado y detalles de pacientes.</p>
              <span className="card__action">Ver listado →</span>
            </Link>
          </li>
          <li>
            <Link to="/buscar" className="card" aria-label="Buscar paciente">
              <h3>Buscar paciente</h3>
              <p>Encuentra pacientes por nombre, RUT o diagnóstico.</p>
              <span className="card__action">Buscar →</span>
            </Link>
          </li>
          <li>
            <Link to="/busqueda" className="card" aria-label="Búsqueda personalizada">
              <h3>Búsqueda personalizada</h3>
              <p>Filtra por múltiples criterios y ordena resultados.</p>
              <span className="card__action">Filtrar →</span>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default Home;
