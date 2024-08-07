import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';

const Item = (props) => {
const precio = 100;

  return (
    <div className='item'>
      <Link to={{ pathname: `/product/${props.id}`, state: { productId: props.id } }} style={{ textDecoration: 'none' }}>
        <img src={props.image} alt="products" />
      </Link>
      <p>{props.name}</p>
      <p>Q.{props.precio}</p>
      <p>{props.image2}</p>
      <p>{props.image3}</p>
      <p>{props.idcat}</p>
    </div>
  );
};

export default Item;
