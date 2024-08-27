import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products,setProducts] = useState([]);
  
  const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    return cart;
  };

  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [precio,setPrecio] = useState();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && userId !== "0") {
      fetch(`https://proyectoasii-vultures.onrender.com/cartItemCount/${userId}`)
        .then((res) => res.json())
        .then((data) => setCartItemCount(data.count));
    } else {
      setCartItemCount(0);
    }
  }, []);

  useEffect(() => {
    fetch('https://proyectoasii-vultures.onrender.com/allproductsDisplay') 
          .then((res) => res.json()) 
          .then((data) => setProducts(data))


    if(localStorage.getItem("auth-token"))
    {
      fetch('https://proyectoasii-vultures.onrender.com/getcart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify(),
    })
      .then((resp) => resp.json())
      .then((data) => {setCartItems(data)});
    }

}, [])
  
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = products.find((product) => product.id === Number(item));
        totalAmount += cartItems[item] * itemInfo.new_price;
      }
    }
    return totalAmount;
  };

  
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];;
      }
    }
    return totalItem;
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if(localStorage.getItem("auth-token"))
    {
      fetch('https://proyectoasii-vultures.onrender.com/addtocart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify({"itemId":itemId}),
    })
      .then((resp) => resp.json())
      .then((data) => {console.log(data)});
    }
  };
  

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if(localStorage.getItem("auth-token"))
    {
      fetch('https://proyectoasii-vultures.onrender.com/removefromcart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify({"itemId":itemId}),
    })
      .then((resp) => resp.json())
      .then((data) => {console.log(data)});
    }
  };

  const contextValue = {products, getTotalCartItems, cartItems, addToCart, removeFromCart, getTotalCartAmount, cartItemCount, setCartItemCount };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
