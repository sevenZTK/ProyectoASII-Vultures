import React, { useEffect, useState } from "react";
import "./ListOrdenes.css";

const ListOrdenes = () => {
  const [allOrdenes, setAllOrdenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoOptions, setEstadoOptions] = useState([]);

  const fetchOrdenes = async () => {
    try {
      const response = await fetch("http://localhost:4000/allordenes");
      const data = await response.json();
      setAllOrdenes(
        data.map((orden) => ({
          ...orden,
          modificandoEstado: false,
          selectedEstado: "",
        }))
      );
    } catch (error) {
      console.error("Error fetching ordenes:", error);
    }
  };

  const fetchEstadoOptions = async () => {
    try {
      const response = await fetch("http://localhost:4000/estadoordenes");
      const data = await response.json();
      setEstadoOptions(data);
    } catch (error) {
      console.error("Error fetching estado opciones:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    fetchEstadoOptions();
  }, []);

  const handleModificarEstado = (id) => {
    setAllOrdenes((ordenes) =>
      ordenes.map((orden) =>
        orden.id === id
          ? { ...orden, modificandoEstado: true }
          : { ...orden, modificandoEstado: false }
      )
    );
  };

  const handleCancelar = (id) => {
    setAllOrdenes((ordenes) =>
      ordenes.map((orden) =>
        orden.id === id ? { ...orden, modificandoEstado: false } : orden
      )
    );
  };

  const handleGuardar = async (id) => {
    const orden = allOrdenes.find((orden) => orden.id === id);
    try {
      await fetch(`http://localhost:4000/modifyorder/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: orden.selectedEstado }),
      });
      fetchOrdenes();
    } catch (error) {
      console.error("Error modificando orden:", error);
    }
  };

  const filteredOrdenes = allOrdenes.filter((orden) =>
    orden.id.toString().includes(searchTerm)
  );

  return (
    <div className="listproduct">
      <h1>Lista de Ordenes</h1>
      <input
        type="text"
        placeholder="Buscar por ID de Orden..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="listproduct-format-main">
        <p>ID</p>
        <p>ID Usuario</p>
        <p>Nombre Usuario</p>
        <p>Dirección Envío</p>
        <p>Método Envío</p>
        <p>Total Orden</p>
        <p>Estado Orden</p>
        <p>Fecha Hora</p>
        <p>Acciones</p>
      </div>
      <div className="listproduct-allordenes">
        <hr />
        {filteredOrdenes.map((orden) => (
          <div key={orden.id}>
            <div className="listproduct-format-main listproduct-format">
              <p>{orden.id}</p>
              <p>{orden.id_usuario}</p>
              <p>{orden.nombre_usuario}</p>
              <p>{orden.direccion_envio}</p>
              <p>{orden.metodo_envio}</p>
              <p>Q. {(orden.total_orden).toFixed(2)}</p>
              <p>{orden.estado_orden}</p>
              <p>{orden.fecha_hora}</p>
              <div>
                {orden.modificandoEstado ? (
                  <>
                    <select
                      value={orden.selectedEstado}
                      onChange={(e) =>
                        setAllOrdenes((ordenes) =>
                          ordenes.map((o) =>
                            o.id === orden.id
                              ? { ...o, selectedEstado: e.target.value }
                              : o
                          )
                        )
                      }
                    >
                      <option value="">Seleccionar estado...</option>
                      {estadoOptions.map((option) => (
                        <option key={option.id} value={option.estado}>
                          {option.estado}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleCancelar(orden.id)}>
                      Cancelar
                    </button>
                    <button onClick={() => handleGuardar(orden.id)}>
                      Guardar
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleModificarEstado(orden.id)}>
                    Modificar Estado de Orden
                  </button>
                )}
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListOrdenes;
