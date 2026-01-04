// DraftContainer.js: Draft Container Component
import React from "react";
import "./DraftContainer.css";

const DraftContainer = () => {
  return (
    <div className="draft-container">
      <div className="draft-header">
        <button className="magic-btn" onClick={() => console.log("Magic Popup Opened")}>Re-generate Shortcut</button>
        <div className="navigation-buttons">
          <button className="prev-btn" onClick={() => console.log("Previous Page")}>◁ Previous</button>
          <button className="next-btn" onClick={() => console.log("Next Page")}>Next ▷</button>
        </div>
      </div>
      <div className="draft-content">
        <p>Draft content goes here...</p>
      </div>
    </div>
  );
};

export default DraftContainer;
