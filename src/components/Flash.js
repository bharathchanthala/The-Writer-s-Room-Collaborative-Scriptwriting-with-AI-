// FlashScreen.js
import React from "react";
import "./Flash.css";
import loaderIcon from "../assets/witch.png"; // Replace with your custom creative icon

const Flash = () => {
  return (
    <div className="flash-overlay">
      <div className="flash-content">
        <img src={loaderIcon} alt="Loading Icon" className="flash-icon" />
        <h1>Generating Your Script...</h1>
        <p>Please wait while we bring your story to life.</p>
      </div>
    </div>
  );
};

export default Flash;
