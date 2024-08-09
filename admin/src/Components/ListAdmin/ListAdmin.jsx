import React, { useEffect, useState } from "react";
import "./ListAdmin.css";
import cross_icon from '../Assets/cross_icon.png';
import editboton from '../Assets/edit-boton.png';

const ListAdmin = () => {
  const [usuariosTipo1, setUsuariosTipo1] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para obtener los usuarios de tipo 1
  const fetchUsuarios = async () => {
    try {
      let url = 'http://localhost:4000/verAdmins';
      if (searchTerm.trim() !== '') {
        url = `http://localhost:4000/searchAdmin?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setUsuariosTipo1(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  // Cargar usuarios al montar el componente o al cambiar el término de búsqueda
  useEffect(() => {
    fetchUsuarios();
  }, [searchTerm]);

  // Función para eliminar un usuario
  const handleDelete = async (id) => {
    try {
      await fetch('http://localhost:4000/eliminarAdmin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      // Actualizar la lista después de eliminar
      setUsuariosTipo1(usuariosTipo1.filter(usuario => usuario.id !== id));
    } catch (error) {
      console.error('Error deleting usuario:', error);
    }
  };

  return (
    <div className="listusuarios">
      <h1>Lista de Usuarios Tipo 1</h1>
      <input
        type="text"
        placeholder="Buscar usuario..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="listusuarios-format-main">
        <p>NOMBRE</p>
        <p>APELLIDO</p>
        <p>CORREO</p>
        <p>TELÉFONO</p>
        <p>ACCIONES</p> {/* Columna para los botones de acción */}
      </div>
      <div className="listusuarios-allusuarios">
        <hr />
        {usuariosTipo1.map((usuario) => (
          <div key={usuario.id}>
            <div className="listusuarios-format-main listusuarios-format">
              <p>{usuario.nombre}</p>
              <p>{usuario.apellido}</p>
              <p>{usuario.correo}</p>
              <p>{usuario.telefono}</p>
              <button onClick={() => handleDelete(usuario.id)}>Eliminar</button>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListAdmin;