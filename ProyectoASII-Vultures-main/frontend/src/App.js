import React, { createContext, useEffect, useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";
import LoginSignup from "./Pages/LoginSignup";
import ProductDisplay from "./Components/ProductDisplay/ProductDisplay";

export const AuthContext = createContext(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth-token"));

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("auth-token");
  };
  
  return (
    <div>
      <Router>
        <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Shop gender="all" />} />
            <Route path="/:category/:subCategory" element={<ShopCategory />} />
            <Route path="/:category" element={<ShopCategory />} />
            <Route path="/search/:searchTerm" element={<ShopCategory />} />
            <Route path='/product' element={<Product />}>
              <Route path=':productId' element={<Product />} />
            </Route>
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
        </AuthContext.Provider>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
