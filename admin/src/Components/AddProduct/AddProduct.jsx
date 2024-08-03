import React, { useState, useEffect } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";

const AddProduct = () => {
  const [images, setImages] = useState([null, null, null]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentCategories, setParentCategories] = useState([]);
  const [productDetails, setProductDetails] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    precio: "",
    cantidad: "",
    id_categoria: "",
    id_variacion: "",
    id_opcion_variacion: "",
    id_variacion_1: "",
    id_opcion_variacion_1: "",
    estado: "1",
  });
  const [categorias, setCategorias] = useState([]);
  const [variaciones, setVariaciones] = useState([]);
  const [opcionesVariacion, setOpcionesVariacion] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [variaciones1, setVariaciones1] = useState([]);
  const [opcionesVariacion1, setOpcionesVariacion1] = useState([]);
  const [productOptions1, setProductOptions1] = useState([]);

  useEffect(() => {
    fetchCategorias();
    fetchVariaciones();
    fetchVariaciones1();
  }, []);

  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/parentcategories');
      const data = await response.json();
      setParentCategories(data);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://localhost:4000/categories');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchVariaciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/variations');
      const data = await response.json();
      setVariaciones(data);
    } catch (error) {
      console.error('Error fetching variaciones:', error);
    }
  };

  const fetchOpcionesVariacion = async (idVariacion) => {
    try {
      const response = await fetch(`http://localhost:4000/options?idVariacion=${idVariacion}`);
      const data = await response.json();
      setOpcionesVariacion(data);
    } catch (error) {
      console.error('Error fetching opciones:', error);
    }
  };

  const fetchVariaciones1 = async () => {
    try {
      const response = await fetch('http://localhost:4000/variations');
      const data = await response.json();
      setVariaciones1(data);
    } catch (error) {
      console.error('Error fetching variaciones:', error);
    }
  };

  const fetchOpcionesVariacion1 = async (idVariacion) => {
    try {
      const response = await fetch(`http://localhost:4000/options?idVariacion=${idVariacion}`);
      const data = await response.json();
      setOpcionesVariacion1(data);
    } catch (error) {
      console.error('Error fetching opciones:', error);
    }
  };

  const fetchProductos = async (searchTerm) => {
    try {
      const response = await fetch(`http://localhost:4000/productos?search=${searchTerm}`);
      const data = await response.json();
      setProductOptions(data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const handleInputChangeName = (event) => {
    const { name, value } = event.target;
    setProductDetails({ ...productDetails, [name]: value });
    if (value.trim() === "") {
      setProductOptions([]);
    } else {
      fetchProductos(value);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProductDetails({ ...productDetails, [name]: value });
  };
  

  const handleImageChange = (event, index) => {
    const newImages = [...images];
    newImages[index] = event.target.files[0];
    setImages(newImages);
  };

  const handleCategoriaChange = (event) => {
    setProductDetails({ ...productDetails, id_categoria: event.target.value });
  };

  const handleVariacionChange = (event) => {
    const idVariacion = event.target.value;
    setProductDetails({ ...productDetails, id_variacion: idVariacion });
    fetchOpcionesVariacion(idVariacion);
  };

  const handleOpcionVariacionChange1 = (event) => {
    setProductDetails({ ...productDetails, id_opcion_variacion_1: event.target.value });
  };

  const handleVariacionChange1 = (event) => {
    const idVariacion1 = event.target.value;
    setProductDetails({ ...productDetails, id_variacion_1: idVariacion1 });
    fetchOpcionesVariacion1(idVariacion1);
  };

  const handleOpcionVariacionChange = (event) => {
    setProductDetails({ ...productDetails, id_opcion_variacion: event.target.value });
  };

  const handleProductOptionSelect = (product) => {
    setProductDetails({
      ...productDetails,
      nombre_producto: product.nombre_producto,
      descripcion_producto: product.descripcion_producto,
    });
    setProductOptions([]);
    document.getElementById("nombre_producto").disabled = true;
    document.getElementById("descripcion_producto").disabled = true;
    document.getElementById("id_categoria").disabled = true;
    document.getElementById("id_categoria").value = product.id_categoria;
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch('http://localhost:4000/addcategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          parentId: document.getElementById('parentCategorySelect').value
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Categoría añadida exitosamente');
        // Limpia el formulario después de agregar la categoría
        setNewCategoryName("");
        setShowCategoryForm(false);
      } else {
        alert('Error al agregar la categoría');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleGuardar = async () => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`product`, image); // Cambiado a 'product' para que coincida con el nombre del campo esperado por multer
      });
  
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });
      const dataObj = await response.json();
  
      if (dataObj.success) {
        const product = {
          ...productDetails,
          precio: parseFloat(productDetails.precio).toFixed(2),
          imagen_producto1: dataObj.image_urls[0], // Corregido para acceder a image_urls en lugar de image_url1
          imagen_producto2: dataObj.image_urls[1], // Corregido para acceder a image_urls en lugar de image_url2
          imagen_producto3: dataObj.image_urls[2], // Corregido para acceder a image_urls en lugar de image_url3
        };
  
        const addProductResponse = await fetch('http://localhost:4000/addproduct', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
  
        const addProductData = await addProductResponse.json();
  
        if (addProductData.success) {
          alert('Producto agregado');
          limpiarCampos();
        } else {
          alert('Error al agregar el producto');
        }
      }
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  const limpiarCampos = () => {
    setImages([null, null, null]);
    setProductDetails({
      nombre_producto: "",
      descripcion_producto: "",
      precio: "",
      cantidad: "",
      id_categoria: "",
      id_variacion: "",
      id_opcion_variacion: "",
      id_variacion_1: "",
      id_opcion_variacion_1: "",
      estado: "1",
    });
  };

  return (
    <div className="addproduct">
      <div className="addproduct-itemfield">
        <p>Nombre del producto</p>
        <input className="addproduct"
          type="text"
          id="nombre_producto"
          name="nombre_producto"
          value={productDetails.nombre_producto}
          onChange={handleInputChangeName}
          placeholder="Ingrese aquí"
        />
        {productOptions.length > 0 && (
          <ul>
            {productOptions.map((option) => (
              <li key={option.id} onClick={() => handleProductOptionSelect(option)}>
                {option.nombre_producto}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="addproduct-itemfield">
        <p>Descripción</p>
        <input
          type="text"
          id="descripcion_producto"
          name="descripcion_producto"
          value={productDetails.descripcion_producto}
          onChange={handleInputChange}
          placeholder="Ingrese aquí"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Precio</p>
          <input
            type="number"
            name="precio"
            value={productDetails.precio}
            onChange={handleInputChange}
            step="0.01"
            placeholder="Ingrese aquí"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Cantidad</p>
          <input
            type="number"
            name="cantidad"
            value={productDetails.cantidad}
            onChange={handleInputChange}
            placeholder="Ingrese aquí"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
      <p>Categoría</p>
        <select
          value={productDetails.id_categoria}
          id="id_categoria"
          name="id_categoria"
          className="add-product-selector"
          onChange={handleCategoriaChange}
        >
          <option value="" disabled>
            Seleccione una categoría
          </option>
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre_categoria}
            </option>
          ))}
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Variación</p>
        <select
          value={productDetails.id_variacion}
          name="id_variacion"
          className="add-product-selector"
          onChange={handleVariacionChange}
        >
          <option value="" disabled>
            Seleccione una variación
          </option>
          {variaciones.map(variacion => (
            <option key={variacion.id} value={variacion.id}>
              {variacion.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Opción de Variación</p>
        <select
          value={productDetails.id_opcion_variacion}
          name="id_opcion_variacion"
          className="add-product-selector"
          onChange={handleOpcionVariacionChange}
        >
          <option value="" disabled>
            Seleccione una opción de variación
          </option>
          {opcionesVariacion.map(opcion => (
            <option key={opcion.id} value={opcion.id}>
              {opcion.valor}
            </option>
          ))}
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Variación Extra Opcional</p>
        <select
          value={productDetails.id_variacion_1}
          name="id_variacion_1"
          className="add-product-selector"
          onChange={handleVariacionChange1}
        >
          <option value="" disabled>
            Seleccione una variación
          </option>
          {variaciones1.map(variacion => (
            <option key={variacion.id} value={variacion.id}>
              {variacion.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Opción de Variación Extra</p>
        <select
          value={productDetails.id_opcion_variacion_1}
          name="id_opcion_variacion_1"
          className="add-product-selector"
          onChange={handleOpcionVariacionChange1}
        >
          <option value="" disabled>
            Seleccione una opción de variación
          </option>
          {opcionesVariacion1.map(opcion => (
            <option key={opcion.id} value={opcion.id}>
              {opcion.valor}
            </option>
          ))}
        </select>
      </div>
      <button onClick={() => setShowCategoryForm(!showCategoryForm)}>
        {showCategoryForm ? 'Cancelar' : 'Nueva Categoría'}
      </button>
      {showCategoryForm && (
        <div className="category-form">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nombre de la categoría"
          />
          <select id="parentCategorySelect">
            <option value="">Selecciona una categoría padre (opcional)</option>
            {parentCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre_categoria}
              </option>
            ))}
          </select>
          <button onClick={() => { handleAddCategory(); window.location.reload(); }}>Añadir Categoría</button>
        </div>
      )}
      <div className="addproduct-itemfield">
        <p>Imágenes del producto</p>
        <div className="image-upload-container">
          {images.map((image, index) => (
            <div key={index} className="image-upload-item">
              <label htmlFor={`file-input-${index}`}>
                <img
                  className="addproduct-thumbnail-img"
                  src={!image ? upload_area : URL.createObjectURL(image)}
                  alt=""
                />
              </label>
              <input
                onChange={(event) => handleImageChange(event, index)}
                type="file"
                name={`imagen_producto${index + 1}`}
                id={`file-input-${index}`}
                hidden
              />
            </div>
          ))}
        </div>
      </div>
      <button className="addproduct-btn" onClick={handleGuardar}>
        AÑADIR
      </button>
    </div>
  );
};

export default AddProduct;
