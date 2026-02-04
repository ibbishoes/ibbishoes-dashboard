import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../utils/auth';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="navbar-title">Dashboard Admin</h1>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">Hola, {user?.name || 'Admin'}</span>
        <button className="btn btn-sm btn-outline" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
