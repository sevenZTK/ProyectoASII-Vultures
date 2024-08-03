import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = (userId) => {
    setLoggedIn(true);
    setUserId(userId);
  };

  return (
    <BrowserRouter>
      <div>
        <Navbar />
        {loggedIn ? <Admin /> : <Login onLogin={handleLogin} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
