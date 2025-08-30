import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import NuevoRegistro from './components/NuevoRegistro';
import ListarPacientes from './components/ListarPacientes';
import ActualizarRegistro from './components/ActualizarRegistro';
import BuscarRegistro from './components/BuscarRegistro';
import BusquedaPersonalizada from './components/BusquedaPersonalizada';
import DetallePaciente from './components/DetallePaciente';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/nuevo">Agregar Paciente</Link>
        <Link to="/listar">Listar Pacientes</Link>
        <Link to="/buscar">Buscar Paciente</Link>
        <Link to="/busqueda">Busqueda Personalizada</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo" element={<NuevoRegistro />} />
        <Route path="/listar" element={<ListarPacientes />} />
        <Route path="/actualizar/:rut" element={<ActualizarRegistro />} />
        <Route path="/buscar" element={<BuscarRegistro />} />
        <Route path="/busqueda" element={<BusquedaPersonalizada />} />
        <Route path="/detalle/:rut" element={<DetallePaciente />} />
      </Routes>
    </Router>
  );
}

export default App;