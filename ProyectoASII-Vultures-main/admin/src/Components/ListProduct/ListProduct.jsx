import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png';
import editboton from '../Assets/edit-boton.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemProducts, setItemProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTitles, setItemTitles] = useState('');

  

  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:4000/allproducts';
      // Si hay un término de búsqueda, agregarlo a la URL
      if (searchTerm.trim() !== '') {
        url = `http://localhost:4000/searchproduct?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]); // Ejecutar fetchProducts cuando cambie searchTerm

  const fetchItemProducts = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/itemproducts/${productId}`);
      const data = await response.json();
      setItemProducts(data);
    } catch (error) {
      console.error('Error fetching item products:', error);
    }
  };

  const updateItemProducts = async (item) => {
    try {
      const { id, cantidad_disp, precio, estado } = item;
  
      await fetch("http://localhost:4000/updateitemproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, cantidad_disp, precio, estado }),
      });
  
      // Actualizar la lista de productos después de modificar los item_products
      fetchProducts();
      // Salir del modo de edición
      setEditMode(false);
      // Limpiar los itemProducts
      setItemProducts([]);
      // Limpiar los títulos de los itemProducts
      setItemTitles('');
    } catch (error) {
      console.error("Error updating item product:", error);
    }
  };

  const removeProduct = async (id) => {
    try {
      await fetch('http://localhost:4000/removeproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      // Actualizar la lista de productos después de eliminar
      fetchProducts();
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

 // En la función handleEdit del componente ListProduct
const handleEdit = async (product) => {
  setSelectedProduct(product);
  setEditMode(true);

  try {
    // Obtener los detalles de los ITEM_PRODUCTO
    const response = await fetch(`http://localhost:4000/itemproducts/${product.id}`);
    const data = await response.json();
    setItemProducts(data);

    // Obtener los títulos de los ITEM_PRODUCTO
    const titlesResponse = await fetch(`http://localhost:4000/itemproducttitles/${product.id}`);
    const titlesData = await titlesResponse.json();
    setItemTitles(titlesData.titles); // Ahora titlesData.titles debe ser un array de títulos únicos
  } catch (error) {
    console.error('Error fetching item products:', error);
  }
};

  
  

  const handleCancel = () => {
    setSelectedProduct(null);
    setItemProducts([]);
    setEditMode(false);
  };

  return (
    <div className="listproduct">
      <h1>Lista de Productos</h1>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="listproduct-format-main">
        <p>IMAGEN</p>
        <p>NOMBRE</p>
        <p>DESCRIPCION</p>
        <p>CATEGORIA</p>
        <p>ELIMINAR</p>
        <p>EDITAR</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {selectedProduct ? (
          <div key={selectedProduct.id}>
            <div className="listproduct-format-main listproduct-format">
              <img className="listproduct-product-icon" src={selectedProduct.imagen_producto1} alt="" />
              <p>{selectedProduct.nombre_producto}</p>
              <p>{selectedProduct.descripcion_producto}</p>
              <p>{selectedProduct.nombre_categoria}</p>
              <img className="listproduct-remove-icon" onClick={() => removeProduct(selectedProduct.id)} src={cross_icon} alt="" />
              <img className="listproduct-edit-icon" onClick={() => handleEdit(selectedProduct)} src={editboton} alt="" />
            </div>
            <hr />
            <div>
              {/* Mostrar los detalles del item_product */}
              {itemProducts.map((item, index) => (
        <div key={item.id}>
          <h3>Item {index + 1} - {itemTitles[index]}</h3>
          <p>Cantidad: <input type="number" value={item.cantidad_disp} onChange={(e) => setItemProducts(prevState => {
            const updatedItemProducts = [...prevState];
            const index = updatedItemProducts.findIndex(i => i.id === item.id);
            updatedItemProducts[index].cantidad_disp = e.target.value;
            return updatedItemProducts;
          })} /></p>
          <p>Precio: <input type="number" value={item.precio} onChange={(e) => setItemProducts(prevState => {
            const updatedItemProducts = [...prevState];
            const index = updatedItemProducts.findIndex(i => i.id === item.id);
            updatedItemProducts[index].precio = e.target.value;
            return updatedItemProducts;
          })} /></p>
          <p>Estado: <input type="text" value={item.estado} onChange={(e) => setItemProducts(prevState => {
            const updatedItemProducts = [...prevState];
            const index = updatedItemProducts.findIndex(i => i.id === item.id);
            updatedItemProducts[index].estado = e.target.value;
            return updatedItemProducts;
          })} /></p>
          <button onClick={() => updateItemProducts(item)}>Guardar</button>
          <button onClick={() => handleCancel(item)}>Cancelar</button>
        </div>
      ))}
            </div>
            <button onClick={() => handleCancel()}>SALIR</button>
          </div>
        ) : (
          allProducts.map((product) => (
            <div key={product.id}>
              <div className="listproduct-format-main listproduct-format">
                <img className="listproduct-product-icon" src={product.imagen_producto1} alt="" />
                <p>{product.nombre_producto}</p>
                <p>{product.descripcion_producto}</p>
                <p>{product.nombre_categoria}</p>
                <img className="listproduct-remove-icon" onClick={() => removeProduct(product.id)} src={cross_icon} alt="" />
                <img className="listproduct-edit-icon" onClick={() => handleEdit(product)} src={editboton} alt="" />
              </div>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListProduct;
