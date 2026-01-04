// Header.js: Header Component
import React from "react";
import "./Header.css";

const Header = () => {
  const toggleNav = () => {
    document.getElementById("primary-nav").classList.toggle("active");
  };

  return (
    <div className="header">
      <button className="hamburger" onClick={toggleNav}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </button>
      <div className="logo">
        <img src="images/titlelogo.png" alt="The Writer's Room Logo" />
      </div>
    </div>
  );
};

export default Header;
