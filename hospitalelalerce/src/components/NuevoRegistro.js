import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NuevoRegistro() {
  const [form, setForm] = useState({
    rut: '', nombre: '', edad: '', sexo: '', fotoPersonal: '', fechaIngreso: '', enfermedad: '', revisado: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    return form.rut.trim() && form.nombre.trim() && form.edad !== '' && form.sexo.trim() && form.enfermedad.trim();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      alert('Todos los campos requeridos (rut, nombre, edad, sexo, enfermedad) deben estar completos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.text();
        alert('Error al crear paciente: ' + err);
        setLoading(false);
        return;
      }
      navigate('/listar');
    } catch (error) {
      alert('Error de conexión: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="rut" value={form.rut} onChange={handleChange} placeholder="RUT" />
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
      <input name="edad" value={form.edad} onChange={handleChange} placeholder="Edad" type="number" />
      <input name="sexo" value={form.sexo} onChange={handleChange} placeholder="Sexo" />
      <input name="fotoPersonal" value={form.fotoPersonal} onChange={handleChange} placeholder="Foto URL" />
      <input name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} type="date" />
      <input name="enfermedad" value={form.enfermedad} onChange={handleChange} placeholder="Enfermedad" />
      <label>
        Revisado
        <input name="revisado" type="checkbox" checked={form.revisado} onChange={handleChange} />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Agregar'}</button>
    </form>
  );
}

export default NuevoRegistro;
