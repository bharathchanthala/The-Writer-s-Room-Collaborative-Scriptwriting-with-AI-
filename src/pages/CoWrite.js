
// CoWrite.js
import React, { useState ,useEffect} from "react";
import "./CoWrite.css";
import logo from "../assets/titlelogo.png";
import userIcon from "../assets/user_icon.png";
import aiIcon from "../assets/ai_icon.png";
import send_icon from "../assets/send_icon.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CoWrite = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userDialogue, setUserDialogue] = useState('');
  const [userCharacter, setUserCharacter] = useState('');
  const [aiCharacter, setAiCharacter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For the button state
  const [loading, setLoading] = useState(false);  // Track AI response loading

  const location = useLocation();
  const navigate = useNavigate();

  const { characters = [] } = location.state || {};

  const handleSave = () => {
    if (!userCharacter || !aiCharacter) {
      alert("Please select both User and AI characters.");
      return;
    }
    setIsChatVisible(true);
  }

  const handleSendDialogue = () => {
    if (userDialogue.trim()) {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', icon: userIcon, character: userCharacter, text: userDialogue.trim() },
      ]);
      setUserDialogue('');
    }
  };

  const handleGenerateAiDialogue = async () => {
    if (chatMessages.length === 0) {
      console.warn("No messages to respond to");
      return;
    }
  
    setLoading(true);  // Show loading animation in chat
    setIsLoading(true);  // Disable the button
  
    try {
      const humanDialogue = chatMessages
        .filter(msg => msg.sender === "user")
        .map(msg => msg.text)
        .join(" ");
  
      // Get the selected text from location state
      const selectedText = location.state?.selectedText || "";
      
      const payload = {
        model: "default:latest",
        messages: [
          {
            role: "system",
            content: `You are playing the character of ${aiCharacter}. 
            Story context: ${story}
            Selected dialogue context: "${selectedText}"
            You are co-writing a dialogue based on this. Your response should consider both the story context 
            and the selected dialogue that the user wants to expand upon or modify. Make sure your response 
            makes sense within both contexts and maintains continuity with the selected dialogue.`
          },
          {
            role: "user",
            content: humanDialogue
          }
        ]
      };
  
      console.log("Request payload:", payload);
  
      const response = await fetch('https://llm.srv.webis.de/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiResponse = "";
      let done = false;
  
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
  
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log("Stream chunk:", chunk);
  
          // Extract and process the JSON fragments from the chunk
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  aiResponse += parsed.message.content;
                }
              } catch (err) {
                console.error("Error parsing JSON chunk:", err, line);
              }
            }
          }
        }
      }
  
      console.log("Full AI response:", aiResponse);
  
      // Add the AI response directly without temporary message
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          sender: 'ai',
          icon: aiIcon,
          character: aiCharacter,
          text: aiResponse.trim() || "I couldn't generate a response. Please try again."
        }
      ]);
  
    } catch (error) {
      console.error("Request error:", error);
      
      // Add error message directly
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          sender: 'ai',
          icon: aiIcon,
          character: aiCharacter,
          text: `Error: ${error.message}`
        }
      ]);
    } finally {
      setIsLoading(false);  // Enable the button
      setLoading(false);   // Hide the loading animation
    }
  };

  
  
  const handleSwopCharacter = () => {
    const temp = userCharacter;
    setUserCharacter(aiCharacter);
    setAiCharacter(temp);
  };

  const handleFinishDialogue = () => {
    const conversationData = chatMessages.map((msg) => ({
      speaker: msg.character,
      content: msg.text,
    }));
  
    console.log("Navigating back with conversation data:", conversationData);
  
    navigate("/write", {
      state: {
        script: location.state.script,
        characters: location.state.characters,
        newConversation: conversationData,
        insertIndex: location.state.insertIndex,
      }
    });
  };
  
  

  const handleUpdateStory = () => {
    setShowPopup(false);
    alert("Story updated successfully!");
  };

  const handleUpdateLine = () => {
    setShowPopup(false);
    alert("Line updated without affecting the rest of the story.");
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (chatMessages.length > 0) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chatMessages]);

  if (!location.state || !location.state.characters) {
    return (
      <div className="error-message">
        <h2>No character data found</h2>
        <p>Please return to the settings page and create characters first.</p>
        <button className="go-back" onClick={() => navigate('/settings')}>
          Go to Settings
        </button>
      </div>
    );
  }
  

  return (
    <div className="cowrite">
      <div className="header">
        <button className="hamburger">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
        <div className="logo">
          <Link to="/ ">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
      </div>

      <div>
        <h1 className="Big-text">Co-Writing Page</h1>
        <p className="Small-text">User: {userCharacter}</p>
        <p className="Small-text">AI: {aiCharacter}</p>
      </div>

      {!isChatVisible ? (
        <div className="character-selection">
        <h2>Select AI Character</h2>
        <p>Available characters: {characters.length}</p>
      
        <div className="dropdown-group">
          <label htmlFor="aiCharacter">AI Character: </label>
          <select
            id="aiCharacter"
            value={aiCharacter}
            onChange={(e) => {
              const selectedCharacter = e.target.value;
              setAiCharacter(selectedCharacter);
              
              // Automatically assign userCharacter to the other available character
              const remainingCharacter = characters.find(char => char.name !== selectedCharacter);
              setUserCharacter(remainingCharacter ? remainingCharacter.name : '');
            }}
          >
            <option value="">Select a Character</option>
            {characters.map((character, index) => (
              <option key={index} value={character.name}>
                {character.name} - {character.trait}
              </option>
            ))}
          </select>
        </div>
      
        <p className="Small-text">User Character: {userCharacter || "Auto-selected"}</p>
      
        <div className="dropdown-group">
          <label htmlFor="story">Story Context:</label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Type your story here..."
          />
        </div>
      
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
      </div>      
      ) : (
        <div className="chat-box">
          <div id="chatMessages" className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <div className="character-info">
                  <img src={msg.icon} alt="icon" className="character-icon" />
                  <div className="character-name">{msg.character}</div>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}

            {/* AI Loading Animation */}
            {loading && (
              <div className="chat-message ai">
                <div className="character-info">
                  <img src={aiIcon} alt="AI icon" className="character-icon" />
                  <div className="character-name">{aiCharacter}</div>
                </div>
                <p className="loading-dots"><span></span><span></span><span></span></p>
              </div>
            )}
          </div>
          
          <div className="dialogue-input">
            <textarea
              id="userDialogue"
              value={userDialogue}
              onChange={(e) => setUserDialogue(e.target.value)}
              placeholder="Enter your line..."
            />
            <img className="Send" onClick={handleSendDialogue} src={send_icon} alt="send" />
          </div>
          <div className="bb">
            <button onClick={handleGenerateAiDialogue} disabled={isLoading}>
              {isLoading ? "Generating..." : "AI's Turn"}
            </button>
            <button onClick={handleSwopCharacter}>Swop Character</button>
            <button onClick={handleFinishDialogue}>Finish</button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              &times;
            </button>
            <h2 id="q">Do you want this change to affect the rest of the story?</h2>
            <div className="popup-buttons">
              <button onClick={handleUpdateStory}>Yes, update the story</button>
              <button onClick={handleUpdateLine}>No, only update this line</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoWrite;
