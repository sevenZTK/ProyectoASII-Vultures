import React, { useState, useEffect } from "react";
import "./AddAdmin.css";
import upload_area from "../Assets/upload_area.svg";

const AddAdmin = () => {
  const [userDetails, setUserDetails] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    contrasena: "",
    id_tipo: 1,  // Tipo de usuario fijo
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    // Validaciones de entrada
    if (name === "nombre" || name === "apellido") {
      if (/^[a-zA-Z\s]*$/.test(value)) {  // Solo letras y espacios
        setUserDetails({ ...userDetails, [name]: value });
      }
    } else if (name === "telefono") {
      if (/^\d*$/.test(value)) {  // Solo números
        setUserDetails({ ...userDetails, [name]: value });
      }
    } else {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    const { nombre, apellido, correo, telefono, contrasena } = userDetails;
    return (
      nombre &&
      apellido &&
      correo &&
      isEmailValid(correo) &&
      telefono.length === 8 &&
      contrasena
    );
  };

  const handleGuardar = async () => {
    if (!isFormValid()) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }
    try {
      const response = await fetch("https://proyectoasii-vultures.onrender.com/addadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
      const data = await response.json();
      if (data.success) {
        alert("Usuario agregado correctamente");
        // Limpiar los campos
        setUserDetails({
          nombre: "",
          apellido: "",
          correo: "",
          telefono: "",
          contrasena: "",
          id_tipo: 1,
        });
      } else {
        alert("Error al agregar el usuario");
      }
    } catch (error) {
      console.error("Error al agregar el usuario:", error);
    }
  };

  return (
    <div className="adduser">
      <div className="adduser-itemfield">
        <p>Nombre</p>
        <input
          type="text"
          name="nombre"
          value={userDetails.nombre}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="adduser-itemfield">
        <p>Apellido</p>
        <input
          type="text"
          name="apellido"
          value={userDetails.apellido}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="adduser-itemfield">
        <p>Correo</p>
        <input
          type="email"
          name="correo"
          value={userDetails.correo}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="adduser-itemfield">
        <p>Teléfono</p>
        <input
          type="text"
          name="telefono"
          value={userDetails.telefono}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
          maxLength="8"
        />
      </div>
      <div className="adduser-itemfield">
        <p>Contraseña</p>
        <input
          type="password"
          name="contrasena"
          value={userDetails.contrasena}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <button className="adduser-btn" onClick={handleGuardar}>
        AÑADIR
      </button>
    </div>
  );
};

export default AddAdmin;
