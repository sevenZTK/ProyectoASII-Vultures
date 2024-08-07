import React from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = (props) => {
  const precio = props.precio;
  return (
    <div className='new-collections'>
      <h1>NUEVOS PRODUCTOS</h1>
      <hr />
      <div className="collections">
        {props.data.map((item) => {
          return <Item
            id={item.id}
            name={item.nombre_producto}
            image={item.imagen_producto1}
            image2={item.imagen_producto2}
            image3={item.imagen_producto3}
            description={item.descripcion_producto}
            idcategoria={item.id_categoria}
            precio={(item.precio).toFixed(2)}
          />
        })}
      </div>
    </div>
  );
};

export default NewCollections;

