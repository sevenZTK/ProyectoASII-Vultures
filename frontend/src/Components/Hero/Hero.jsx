import React, { useEffect, useState } from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";
import hand_icon from "../Assets/hand_icon.png";
import arrow_icon from "../Assets/arrow.png";

const Hero = ({ promoCategory, idPadre, nombreCat, promo, desc }) => {

  const handleClick = () => {
    if (promoCategory) {
      const idCat = promoCategory;
      const idPadreCat = idPadre;
      window.location.href = `/${idPadreCat}/${idCat}`;
    }
  };

return (
    <div className="hero">
      <div className="hero-left">
        <p>{promo}</p>
        <h2>{desc}</h2>
        <div>
          <div className="hero-hand-icon">
            <p>DESCUENTOS EN</p>
            <img src={hand_icon} alt="" />
          </div>
          {promoCategory && (
            <>
              <p>{nombreCat}</p>
            </>
          )}
        </div>
        <div className="hero-latest-btn" onClick={handleClick}>
          <div>VER</div>
          <img src={arrow_icon} alt="" />
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="hero" />
      </div>
    </div>
  );
};

export default Hero;
