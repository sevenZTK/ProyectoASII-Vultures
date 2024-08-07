import React, { useState, useEffect } from "react";
import "./AddPromociones.css";
import upload_area from "../Assets/upload_area.svg";

const AddPromociones = () => {
  const [promotionDetails, setPromotionDetails] = useState({
    nombre: "",
    descripcion: "",
    descuento_porcentaje: "",
    fecha_inicio: "",
    fecha_final: "",
    categorias: []
  });
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://localhost:4000/categories");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPromotionDetails({ ...promotionDetails, [name]: value });
  };

  const handleAddCategoria = () => {
    setPromotionDetails({
      ...promotionDetails,
      categorias: [...promotionDetails.categorias, ""]
    });
  };

  const handleRemoveCategoria = (index) => {
    const updatedCategorias = [...promotionDetails.categorias];
    updatedCategorias.splice(index, 1);
    setPromotionDetails({
      ...promotionDetails,
      categorias: updatedCategorias
    });
  };

  const handleCategoriaChange = (event, index) => {
    const updatedCategorias = [...promotionDetails.categorias];
    updatedCategorias[index] = event.target.value;
    setPromotionDetails({
      ...promotionDetails,
      categorias: updatedCategorias
    });
  };


  const handleGuardar = async () => {
    try {
      for (const categoriaId of promotionDetails.categorias) {
        const promotionToSend = {
          ...promotionDetails,
          categorias: [categoriaId] // Se envía solo una categoría por cada iteración
        };

        const response = await fetch("http://localhost:4000/addpromotions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(promotionToSend),
        });
        const data = await response.json();
        if (data.success) {
          alert("Promoción agregada correctamente");
        } else {
          alert("Error al agregar la promoción");
        }
      }
    } catch (error) {
      console.error("Error al agregar la promoción:", error);
    }
  };

  return (
    <div className="addpromotion">
      <div className="addpromotion-itemfield">
        <p>Nombre de la promoción</p>
        <input
          type="text"
          name="nombre"
          value={promotionDetails.nombre}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="addpromotion-itemfield">
        <p>Descripción</p>
        <input
          type="text"
          name="descripcion"
          value={promotionDetails.descripcion}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="addpromotion-itemfield">
        <p>Descuento (%)</p>
        <input
          type="number"
          name="descuento_porcentaje"
          value={promotionDetails.descuento_porcentaje}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="addpromotion-itemfield">
        <p>Fecha de inicio</p>
        <input
          type="date"
          name="fecha_inicio"
          value={promotionDetails.fecha_inicio}
          onChange={handleInputChange}
          min={new Date().toISOString().split("T")[0]} // Fecha actual como mínimo
        />
      </div>
      <div className="addpromotion-itemfield">
        <p>Fecha final</p>
        <input
          type="date"
          name="fecha_final"
          value={promotionDetails.fecha_final}
          onChange={handleInputChange}
          min={promotionDetails.fecha_inicio} // Fecha de inicio como mínimo
        />
      </div>
      <div className="addpromotion-itemfield">
        <p>Categoría</p>
        {promotionDetails.categorias.map((_, index) => (
          <div key={index}>
            <select
              name={`categoria${index}`}
              value={promotionDetails.categorias[index]}
              onChange={(event) => handleCategoriaChange(event, index)}
            >
              <option value="" disabled>
                Seleccione una categoría
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
            <button onClick={() => handleRemoveCategoria(index)}>Quitar</button>
          </div>
        ))}
        <button onClick={handleAddCategoria}>Añadir otra categoría</button>
      </div>
      <button className="addpromotion-btn" onClick={handleGuardar}>
        AÑADIR
      </button>
    </div>
  );
};

export default AddPromociones;
