import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from "../Components/Item/Item";
import { Link, useParams } from "react-router-dom";

const ShopCategory = (props) => {
  const { category, subCategory, searchTerm } = useParams();
  const [allproducts, setAllProducts] = useState([]);
  const [displayedProductsCount, setDisplayedProductsCount] = useState(0);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const productsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproductsDisplay') 
      .then((res) => res.json()) 
      .then((data) => {
        setAllProducts(data);
        setDisplayedProducts(data.slice(0, productsPerPage));
      });
  }

    useEffect(() => {
      fetchInfo();
    }, [])
    console.log(subCategory);
    
    useEffect(() => {
      if (searchTerm) {
        const filteredProducts = allproducts.filter(item => 
          item.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayedProducts(filteredProducts.slice(0, productsPerPage));
        setDisplayedProductsCount(filteredProducts.length);
        setCurrentPage(1);
      } else {
        const filteredProducts = subCategory 
          ? allproducts.filter(item => Number(subCategory) === item.id_categoria)
          : allproducts.filter(item => Number(category) === item.id_categoria);
        setDisplayedProducts(filteredProducts.slice(0, productsPerPage));
        setDisplayedProductsCount(filteredProducts.length);
        setCurrentPage(1);
      }
    }, [allproducts, category, subCategory, searchTerm]);
  
    const handleLoadMore = () => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const nextProducts = subCategory 
        ? allproducts.filter(item => Number(subCategory) === item.id_categoria)
        : allproducts.filter(item => Number(category) === item.id_categoria);
      setDisplayedProducts(prevProducts => [...prevProducts, ...nextProducts.slice(startIndex, endIndex)]);
      setCurrentPage(nextPage);
    };

    return (
      <div className="shopcategory">
        <img src={props.banner} className="shopcategory-banner" alt="" />
        <div className="shopcategory-indexSort">
          <p><span>Showing {currentPage === 1 ? 1 : (currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, displayedProductsCount)}</span> out of {displayedProductsCount} Products</p>
          <div className="shopcategory-sort">Sort by  <img src={dropdown_icon} alt="" /></div>
        </div>
        
        <div className="shopcategory-products">
          {displayedProducts.map((item,i) => (
            <Item 
              key={item.id}
              id={item.id}
              name={item.nombre_producto}
              image={item.imagen_producto1}
              description={item.descripcion_producto}
              idcategoria={item.id_categoria}
              precio={(item.precio).toFixed(2)}
            />
          ))}
        </div>
        
        {displayedProducts.length < displayedProductsCount && (
          <div className="shopcategory-loadmore">
            <button onClick={handleLoadMore}>Explore More</button>
          </div>
        )}
      </div>
    );
  };
  
  export default ShopCategory;