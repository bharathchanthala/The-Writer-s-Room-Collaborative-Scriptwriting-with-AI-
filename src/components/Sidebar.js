// Sidebar.js: Sidebar Component
import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const closeNav = () => {
    document.getElementById("primary-nav").classList.remove("active");
  };

  return (
    <div id="primary-nav" className="primary-nav">
      <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>
        ×
      </a>
      <ul>
        <li><a href="welcome.html">New</a></li>
        <li><a href="#">Recent</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
