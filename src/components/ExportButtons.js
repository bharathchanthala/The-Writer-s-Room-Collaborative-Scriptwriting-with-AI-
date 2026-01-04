// ExportButtons.js: Export and Expand Buttons
import React from "react";
import "./ExportButtons.css";

const ExportButtons = () => {
  return (
    <div className="export-buttons">
      <button className="expand-btn" onClick={() => console.log("Expand Story")}>Expand Story</button>
      <button className="export-btn" onClick={() => console.log("Export Story")}>Export Story</button>
    </div>
  );
};

export default ExportButtons;
