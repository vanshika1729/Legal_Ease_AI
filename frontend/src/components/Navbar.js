import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ token, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => setIsOpen(false);

  const handleLogout = () => {
    onLogout();
    closeMobileMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          LegalEase AI
        </Link>
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {console.log("isOpen:",isOpen)}
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>Home</Link>
          </li>
          {token && (
            <>
              <li className="nav-item">
                <Link to="/generate" className="nav-links" onClick={closeMobileMenu}>Generate</Link>
              </li>
              <li className="nav-item">
                <Link to="/saved" className="nav-links" onClick={closeMobileMenu}>Saved Notices</Link>
              </li>
            </>
          )}
          {!token ? (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links-mobile" onClick={closeMobileMenu}>Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-links-mobile" onClick={closeMobileMenu}>Register</Link>
              </li>
            </>
          ) : (
             <li className="nav-item">
              <button className="nav-links-mobile" onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
        {/* --- DESKTOP BUTTONS RESTORED --- */}
        <div className='navbar-auth-buttons'>
          {!token ? (
            <>
              <Link to="/login">
                <button className="btn--outline">LOGIN</button>
              </Link>
              <Link to="/register">
                  <button className="btn--outline">REGISTER</button>
              </Link>
            </>
          ) : (
             <button className="btn--outline" onClick={handleLogout}>LOGOUT</button>
          )}
        </div> 
      </div>
    </nav>
  );
};

export default Navbar;