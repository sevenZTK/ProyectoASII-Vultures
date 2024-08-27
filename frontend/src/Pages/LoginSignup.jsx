import React, { useState, useEffect, useContext } from "react";
import "./CSS/LoginSignup.css";
import { AuthContext } from "../App";

const LoginSignup = () => {
  const { isLoggedIn, handleLogin, handleLogout } = useContext(AuthContext);
  const [state, setState] = useState("Login");
  const [loginFormData, setLoginFormData] = useState({
    correo: "",
    contrasena: ""
  });
  const [signupFormData, setSignupFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    telefono: "",
    direccion: "",
    estado: "",
    ciudad: "",
    codigo_postal: "",
    id_pais: ""
  });
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch("https://proyectoasii-vultures.onrender.com/countries")
      .then((resp) => resp.json())
      .then((data) => {
        setCountries(data);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  const loginChangeHandler = (e) => {
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const signupChangeHandler = (e) => {
    setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    const response = await fetch("https://proyectoasii-vultures.onrender.com/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginFormData),
    });
    const data = await response.json();

    if (data.success) {
      localStorage.setItem("auth-token", data.token);
      localStorage.setItem("userId", data.userId);
      handleLogin();
      window.location.replace("/");
    } else {
      alert(data.errors);
    }
  };

  const signup = async () => {
    const response = await fetch("https://proyectoasii-vultures.onrender.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupFormData),
    });
    const data = await response.json();
  
    if (data.success) {
      localStorage.setItem("auth-token", data.token);
      handleLogin();
      // Después del registro exitoso, realiza el inicio de sesión automáticamente
      await loginAfterSignup(signupFormData);
      window.location.replace("/");
    } else {
      alert(data.errors);
    }
  };
  
  const loginAfterSignup = async (userData) => {
    const response = await fetch("https://proyectoasii-vultures.onrender.com/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: userData.correo,
        contrasena: userData.contrasena,
      }),
    });
    const data = await response.json();
  
    if (data.success) {
      localStorage.setItem("auth-token", data.token);
      localStorage.setItem("userId", data.userId);
      handleLogin();
    } else {
      alert(data.errors);
    }
  };
  

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                name="nombre"
                value={signupFormData.nombre}
                onChange={signupChangeHandler}
              />
              <input
                type="text"
                placeholder="Apellido"
                name="apellido"
                value={signupFormData.apellido}
                onChange={signupChangeHandler}
              />
              <input
                type="text"
                placeholder="Telefono"
                name="telefono"
                value={signupFormData.telefono}
                onChange={signupChangeHandler}
              />
              <input
                type="text"
                placeholder="Dirección"
                name="direccion"
                value={signupFormData.direccion}
                onChange={signupChangeHandler}
              />
              <select name="id_pais" value={signupFormData.id_pais} onChange={signupChangeHandler}>
                <option value="">Seleccione un país</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.nombre_pais}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ciudad"
                name="ciudad"
                value={signupFormData.ciudad}
                onChange={signupChangeHandler}
              />
              <input
                type="text"
                placeholder="Estado"
                name="estado"
                value={signupFormData.estado}
                onChange={signupChangeHandler}
              />
              <input
                type="text"
                placeholder="Código Postal"
                name="codigo_postal"
                value={signupFormData.codigo_postal}
                onChange={signupChangeHandler}
              />
              <input
                type="email"
                placeholder="Correo"
                name="correo"
                value={signupFormData.correo}
                onChange={signupChangeHandler}
              />
              <input
                type="password"
                placeholder="contrasena"
                name="contrasena"
                value={signupFormData.contrasena}
                onChange={signupChangeHandler}
              />
              <button onClick={signup}>
                Continue
              </button>
            </>
          )}
          {state === "Login" && (
            <>
              <input
                type="email"
                placeholder="Correo"
                name="correo"
                value={loginFormData.correo}
                onChange={loginChangeHandler}
              />
              <input
                type="password"
                placeholder="contrasena"
                name="contrasena"
                value={loginFormData.contrasena}
                onChange={loginChangeHandler}
              />
              <button onClick={login}>
                Continue
              </button>
            </>
          )}
        </div>

        {state === "Login" ? (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
