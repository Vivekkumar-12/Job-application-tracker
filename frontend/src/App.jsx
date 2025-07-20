import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate("/login");
  };

  // Listen for login changes (optional, for SPA)
  window.addEventListener("storage", () => {
    setLoggedIn(!!localStorage.getItem("token"));
  });

  return (
    <header className="navbar">
      <div className="nav1">
        <div className="navbar-left">
          <div className="logo-box">JT</div>
          <span className="navbar-title">Job Tracker</span>
        </div>
        <div className="navbar-right">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          {!loggedIn && <Link to="/login">Login</Link>}
          {!loggedIn && <Link to="/signup">Signup</Link>}
          {loggedIn && <button onClick={handleLogout} style={{background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer'}}>Logout</button>}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}