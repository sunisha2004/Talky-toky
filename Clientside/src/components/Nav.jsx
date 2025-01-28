import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../scss/Nav.scss";

const Nav = ({ profile, setName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Talky-Toky</h1>
      </div>
      <div className="navbar-center">
        <input
          type="text"
          placeholder="Search..."
          className="search-input" onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="navbar-right">
        <div className="profile-pic" onClick={toggleDropdown}>
          <img
            src={profile}
            alt="Profile"
            className="profile-img"
          />
        </div>
        {dropdownOpen && (
          <div className="dropdown-menu">
            <Link to="/profile" className="dropdown-item">
              Profile
            </Link>
            <button onClick={handleLogout} className="dropdown-item">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
