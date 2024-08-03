import React, { useContext, useRef, useState, useEffect } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';
import { AuthContext } from "../../App";

const Navbar = () => {
  const { isLoggedIn, handleLogin, handleLogout } = useContext(AuthContext);
  const { getTotalCartItems } = useContext(ShopContext);
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [relatedCategories, setRelatedCategories] = useState([]);
  const [prevCategories, setPrevCategories] = useState([]);
  const menuRef = useRef();
  const userId = localStorage.getItem("userId");
  const { cartItemCount, setCartItemCount } = useContext(ShopContext);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Actualizar la interfaz de usuario cuando cambie cartItemCount
  }, [cartItemCount]);

  const handleSearch = () => {
    // Redirigir a la página de resultados de búsqueda con el término de búsqueda
    window.location.href = `/search/${searchTerm}`;
  };

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/ParentCategoriesNav');
        if (response.ok) {
          const data = await response.json();
          setParentCategories(data);
        } else {
          throw new Error('Error al obtener las categorías principales');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchParentCategories();
  }, []);

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:4000/SubCategories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Error al obtener las subcategorías');
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleCategoryClick = async (categoryId, event) => {
    event.preventDefault();
    setSelectedCategory(categoryId);
    setSelectedSubCategory(null);
    setPrevCategories(prevCategories => [...prevCategories, categoryId]);
    const subCategories = await fetchSubCategories(categoryId);
    
    // Verificar si la categoría seleccionada tiene subcategorías hijas
    if (subCategories.length === 0) {
      // Si la categoría no tiene subcategorías, redirigir
      window.location.href = `/${categoryId}`;
    } else {
      // Si la categoría tiene subcategorías, actualizar el estado
      setRelatedCategories(subCategories);
    }
  };
  

  const handleSubCategoryClick = async (subCategoryId, event) => {
    event.preventDefault();
    setSelectedSubCategory(subCategoryId);
    const subCategories = await fetchSubCategories(subCategoryId);
    if (subCategories.length === 0) {
      // Si la subcategoría no tiene subcategorías hijas, redirige a la página correspondiente
      window.location.href = `/${selectedCategory}/${subCategoryId}`;
    } else {
      // Si la subcategoría tiene subcategorías hijas, muestra las subcategorías relacionadas
      setPrevCategories(prevCategories => [...prevCategories, selectedCategory]);
      setRelatedCategories(subCategories);
    }
  };

  const handleGoBack = () => {
    const prevCategory = prevCategories.pop();
    setSelectedCategory(prevCategory);
    setSelectedSubCategory(null);
    setPrevCategories([...prevCategories]);
    fetchSubCategories(prevCategory).then(subCategories => setRelatedCategories(subCategories));
  };
  

  console.log(isLoggedIn);
  console.log(userId);

  return (
    <div className='nav'>
      <Link to='/' onClick={() => setSelectedCategory(null)} style={{ textDecoration: 'none' }} className='nav-logo'>
        <img src={logo} alt='logo' />
        <p>SHOPPER</p>
      </Link>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>
      <img onClick={() => handleCategoryClick(null)} className='nav-dropdown' src={nav_dropdown} alt='' />
      <ul ref={menuRef} className='nav-menu'>
        {parentCategories.map((category) => (
          <li key={category.id}>
            <a href="/" onClick={(e) => handleCategoryClick(category.id, e)}>
              {category.nombre_categoria}
            </a>
            {selectedCategory === category.id && (
              <div className='submenu'>
                <ul>
                  {relatedCategories.map((subcategory) => (
                    <li key={subcategory.id}>
                      <a href="/" onClick={(e) => handleSubCategoryClick(subcategory.id, e)}>
                        {subcategory.nombre_categoria}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
        {selectedSubCategory && (
          <li>
            <button onClick={handleGoBack}>Regresar</button>
          </li>
        )}
      </ul>
      <div className='nav-login-cart'>
        {localStorage.getItem('auth-token') ? (
          <button onClick={() => {localStorage.userId=0; handleLogout(); localStorage.removeItem('auth-token'); window.location.replace('/');}}>Logout</button>
        ) : (
          <Link to='/login' style={{ textDecoration: 'none' }}>
            <button>Login</button>
          </Link>
        )}
        {userId && userId !== "0" ? (
  <Link to='/cart'>
    <img src={cart_icon} alt='cart' />
    {setCartItemCount(cartItemCount)}
    {cartItemCount !== 0 && <div className='nav-cart-count'>{cartItemCount}</div>}
  </Link>
) : (
  <button onClick={() => alert("Debes iniciar sesión antes de ver el carrito.")}>
    <img src={cart_icon} alt='cart' />
    {setCartItemCount(cartItemCount)}
    {cartItemCount !== 0 && <div className='nav-cart-count'>{cartItemCount}</div>}
  </button>
)}

      </div>
    </div>
  );
};

export default Navbar;
