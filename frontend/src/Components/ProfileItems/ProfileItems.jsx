import React, { useContext, useEffect, useState } from "react";
import "./ProfileItems.css";
import profile_icon from '../Assets/profile-icon.png';
import { useParams } from "react-router-dom";

const ProfileItems = () => {
  const [user, setUser] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`https://proyectoasii-vultures.onrender.com/user/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  return (
    <div className="profile-page">
      <h1>Perfil de Usuario</h1>
      <img src={profile_icon} alt='cart' />
      <div className="profile-info">
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Apellido:</strong> {user.apellido}</p>
        <p><strong>Correo:</strong> {user.correo}</p>
        <p><strong>Teléfono:</strong> {user.telefono}</p>
      </div>
    </div>
  );
};

export default ProfileItems;
