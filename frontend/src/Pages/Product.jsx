import React, { useContext } from 'react'
import Breadcrums from '../Components/Breadcrums/Breadcrums'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay'
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox'
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'

const Product = () => {
  const { products } = useContext(ShopContext);
  const { productId } = useParams();
  // Buscar el producto por su ID
  const product = products.find((e) => e.id === Number(productId));
  
  // Verificar si el producto está definido antes de utilizarlo
  if (!product) {
    return <div>Loading...</div>; // O algún manejo de estado de carga apropiado
  }

  return (
    <div>
      {/* Asegúrate de pasar el producto correctamente al componente ProductDisplay */}
      <Breadcrums product={product} />
      <ProductDisplay
        id={productId}
        name={product.nombre_producto}
        description={product.descripcion_producto}
        image1={product.imagen_producto1}
        image2={product.imagen_producto2}
        image3={product.imagen_producto3}
        categoryName={product.nombre_categoria}
        idcat={product.id_categoria}
      />
    </div>
  );
};


export default Product
