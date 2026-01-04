// Welcome.js: the main page
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';
import logo from '../assets/titlelogo.png';
import { faQuestionCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Welcome = () => {
  const [isNavOpen, setNavOpen] = useState(false);
  const [showTeamInfo, setShowTeamInfo] = useState(false);

  const toggleNav = () => {
    setNavOpen(!isNavOpen);
  };

  const toggleTeamInfo = () => {
    setShowTeamInfo(!showTeamInfo);
  };

  return (
    <div className="welcome-page">
      {/* Header */}
      <div className="header">
        <button className="hamburger">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
        <div className="logo">
          <img src={logo} alt="The Writer's Room Logo" />
        </div>
      </div>

      {/* Sidebar */}
      <div id="primary-nav" className={`primary-nav ${isNavOpen ? 'open' : ''}`}>
        <button className="closebtn" onClick={toggleNav}></button>
        <ul className="sidebar">
          <li>
            <a href="welcome.html">New</a>
          </li>
          {/* <li>
            <button className="link-button" onClick={handleRecentClick}>
              Recent
            </button>
          </li> */}
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome to the Writer's Room!</h1>
        <h5 className="h5">Here we can brainstorm script writing, from idea to screenplay!</h5>
        <div className="buttons">
          <Link to="/draft">
            <button className="draft-button">Have an Idea? Start Drafting</button>
          </Link>
          <Link to="/settings">
            <button className="generator-button">Try Random Idea Generator</button>
          </Link>
        </div>
      </div>

      {/* Floating Button */}
      <button className="floating-btn" onClick={toggleTeamInfo}>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </button>

      {/* Team Info Popup */}
      {showTeamInfo && (
        <div className="team-info-modal">
          <div className="team-info-content">
            <h3>Meet Our Development Team</h3>
            <p>🎭 Tutor: Marcel, Nailia</p>
            <p>🎨 Frontend: Bharath, Katy</p>
            <p>💻 Backend: Ankit, Furqan, Christin, Valentina, Sumukh, Bhavani</p>
            <button onClick={toggleTeamInfo} className="close-btn">
              <FontAwesomeIcon icon={faTimes} /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
