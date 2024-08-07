import React, { useEffect, useState } from "react";
import "./ListPromociones.css";
import cross_icon from '../Assets/cross_icon.png';
import editboton from '../Assets/edit-boton.png';

const ListPromociones = () => {
  const [allPromociones, setAllPromociones] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedPromocion, setSelectedPromocion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  

  const fetchPromociones = async () => {
    try {
      let url = 'http://localhost:4000/allpromociones';
      if (searchTerm.trim() !== '') {
        url = `http://localhost:4000/searchpromocion?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setAllPromociones(data);
    } catch (error) {
      console.error('Error fetching promociones:', error);
    }
  };

  useEffect(() => {
    fetchPromociones();
  }, [searchTerm]);

  const handleEdit = (promocion) => {
    setSelectedPromocion({
      ...promocion,
      edit: true // Marcar el campo como editable
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setSelectedPromocion(null);
    setEditMode(false);
  };

  const removePromocion = async (id) => {
    try {
      await fetch('http://localhost:4000/removepromocion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      fetchPromociones();
    } catch (error) {
      console.error('Error removing promocion:', error);
    }
  };

  return (
    <div className="listproduct">
      <h1>Lista de Temporadas</h1>
      <input
        type="text"
        placeholder="Buscar promoción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="listproduct-format-main">
        <p>NOMBRE</p>
        <p>DESCRIPCION</p>
        <p>DESCUENTO (%)</p>
        <p>FECHA INICIO</p>
        <p>FECHA FINAL</p>
        <p>CATEGORIA</p>
      </div>
      <div className="listproduct-allpromociones">
        <hr />
        {selectedPromocion ? (
          <div key={selectedPromocion.id}>
            <div className="listproduct-format-main listproduct-format">
              <p>{selectedPromocion.nombre}</p>
              <p>{selectedPromocion.descripcion}</p>
              <p>{selectedPromocion.descuento_porcentaje}</p>
              <p>{selectedPromocion.fecha_inicio}</p>
              <p>{selectedPromocion.fecha_final}</p>
              <p>{selectedPromocion.categoria_nombre}</p>
              <img className="listproduct-remove-icon" onClick={() => removePromocion(selectedPromocion.id)} src={cross_icon} alt="" />
              <img className="listproduct-edit-icon" onClick={() => handleEdit(selectedPromocion)} src={editboton} alt="" />
            </div>
            <hr />
            <button onClick={() => handleCancel()}>SALIR</button>
          </div>
        ) : (
          allPromociones.map((promocion) => (
            <div key={promocion.id}>
              <div className="listproduct-format-main listproduct-format">
                <p>{promocion.nombre}</p>
                <p>{promocion.descripcion}</p>
                <p>{promocion.descuento_porcentaje}</p>
                <p>{promocion.fecha_inicio}</p>
                <p>{promocion.fecha_final}</p>
                <p>{promocion.categoria_nombre}</p>
                <img className="listproduct-remove-icon" onClick={() => removePromocion(promocion.id)} src={cross_icon} alt="" />
                <img className="listproduct-edit-icon" onClick={() => handleEdit(promocion)} src={editboton} alt="" />
              </div>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListPromociones;
