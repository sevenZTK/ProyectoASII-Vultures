import React, { useEffect, useState } from "react";
import "./Wishitems.css";
import cross_icon from "../Assets/cart_cross_icon.png";

const Wishitems = () => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId && userId !== "0") {
      fetch(`https://proyectoasii-vultures.onrender.com/wishlistItems/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setDisplayedItems(data);
        });
    }
  }, [userId]);

  const handleRemoveItem = async (userId, itemId) => {
    try {
      const response = await fetch("https://proyectoasii-vultures.onrender.com/removeWishlistItem", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, itemId }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedItems = displayedItems.filter((item) => item.id !== itemId);
        setDisplayedItems(updatedItems);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleAddToCart = async (userId, wishlistItemId) => {
    try {
      // Obtener el ID del ITEM_PRODUCTO desde la lista de deseos
      const wishlistResponse = await fetch(`https://proyectoasii-vultures.onrender.com/wishlistItem/${wishlistItemId}`);
      const wishlistItem = await wishlistResponse.json();

      if (!wishlistItem) {
        console.error("Item de wishlist no encontrado.");
        return;
      }

      const itemProductId = wishlistItem.id_item_producto;

      // Verificar si el usuario ya tiene un carrito
      const cartResponse = await fetch(`https://proyectoasii-vultures.onrender.com/cart/${userId}`);
      const cartData = await cartResponse.json();

      let cartId;

      if (cartData.cartExists) {
        cartId = cartData.cartId;
      } else {
        // Crear un nuevo carrito si no existe
        const createCartResponse = await fetch("https://proyectoasii-vultures.onrender.com/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
        const createCartData = await createCartResponse.json();
        cartId = createCartData.cartId;
      }

      // Agregar el ítem al carrito
      const addToCartResponse = await fetch(`https://proyectoasii-vultures.onrender.com/cartItem/${cartId}/${itemProductId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: 1 }), // Puedes ajustar la cantidad si es necesario
      });

      const addToCartData = await addToCartResponse.json();

      if (addToCartData.success) {
        // Eliminar el ítem de la lista de deseos
        const removeFromWishlistResponse = await fetch("https://proyectoasii-vultures.onrender.com/removeWishlistItem", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, itemId: wishlistItemId }),
        });

        const removeFromWishlistData = await removeFromWishlistResponse.json();

        if (removeFromWishlistData.success) {
          // Actualizar los ítems mostrados después de la eliminación
          const updatedItems = displayedItems.filter((item) => item.id !== wishlistItemId);
          setDisplayedItems(updatedItems);
        } else {
          console.error("Error al eliminar el ítem de la lista de deseos:", removeFromWishlistData.error);
        }
      } else {
        console.error("Error al agregar el ítem al carrito:", addToCartData.error);
      }
    } catch (error) {
      console.error("Error al manejar el carrito:", error);
    }
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Imagen</p>
        <p>Producto</p>
        <p>Precio</p>
        <p>Cantidad</p>
        <p>Descuento</p>
        <p>Total</p>
        <p>Comprar</p>
        <p>Eliminar</p>
      </div>
      <hr />
      {displayedItems.map((item) => (
        <div key={item.id}>
          <div className="cartitems-format-main cartitems-format">
            <img
              className="cartitems-product-icon"
              src={item.imagen_producto1}
              alt=""
            />
            <p>{item.nombre_producto}</p>
            <p>Q.{item.precio.toFixed(2)}</p>
            <div>
              <p>{item.cantidad}</p>
            </div>
            <p>{item.descuento}%</p>
            <p>
              Q.
              {(
                (item.precio - item.precio * (item.descuento / 100)) *
                item.cantidad
              ).toFixed(2)}
            </p>

            <button
              onClick={() => {
                handleAddToCart(userId, item.id);
              }}
              className="cartitems-add-to-cart"
            >
              Agregar al Carrito
            </button>
            <button
              onClick={() => {
                handleRemoveItem(userId, item.id);
              }}
              className="cartitems-remove-icon"
            >
              <img src={cross_icon} alt="" />
            </button>
          </div>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default Wishitems;
