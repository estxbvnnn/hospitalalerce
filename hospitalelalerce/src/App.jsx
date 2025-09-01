import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import NuevoRegistro from './components/NuevoRegistro.jsx';
import ListarPacientes from './components/ListarPacientes.jsx';
import BuscarRegistro from './components/BuscarRegistro.jsx';
import BusquedaPersonalizada from './components/BusquedaPersonalizada.jsx';
import DetallePaciente from './components/DetallePaciente.jsx';
import ActualizarRegistro from './components/ActualizarRegistro.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nuevo" element={<NuevoRegistro />} />
      <Route path="/listar" element={<ListarPacientes />} />
      <Route path="/buscar" element={<BuscarRegistro />} />
      <Route path="/busqueda" element={<BusquedaPersonalizada />} />
      <Route path="/detalle/:id" element={<DetallePaciente />} />
      <Route path="/actualizar/:id" element={<ActualizarRegistro />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
