// Popup.js: Generic Popup Component
import React from "react";
import "./Popup.css";

const Popup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="popup">
      <p>{message}</p>
      <div className="popup-buttons">
        <button onClick={onConfirm} className="confirm-btn">Yes</button>
        <button onClick={onCancel} className="cancel-btn">No</button>
      </div>
    </div>
  );
};

export default Popup;