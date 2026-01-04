// DialogueSection.js: Dialogue Section Component
import React from "react";
import "./DialogueSection.css";

const DialogueSection = () => {
  return (
    <div className="dialogue-section">
      <div className="dialogue-box">
        <p>User: This is a line of dialogue...</p>
        <button className="paraphrase-btn">Paraphrase</button>
        <button className="regenerate-btn">Re-generate</button>
        <button className="feedback-btn">Feedback</button>
      </div>
    </div>
  );
};

export default DialogueSection;