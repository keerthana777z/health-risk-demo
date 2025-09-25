// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Navbar.css';

const Navbar = ({ session, onLoginClick, onSignUpClick }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          HealthPredict
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/predictions" className="nav-item">
            Predictions
          </Link>
          {/* Only show Profile link if user is logged in */}
          {session && (
            <Link to="/profile" className="nav-item">
              Profile
            </Link>
          )}
        </div>
        <div className="nav-buttons">
          {session ? (
            // If user is logged in, show their email and a Logout button
            <>
              <span className="user-email">{session.user.email}</span>
              <button onClick={handleLogout} className="nav-btn signup-btn">Logout</button>
            </>
          ) : (
            // If user is logged out, show Login and Sign Up buttons
            <>
              <button onClick={onLoginClick} className="nav-btn login-btn">Login</button>
              <button onClick={onSignUpClick} className="nav-btn signup-btn">Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;