import React, { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import './ContentBox.css';

const ContentBox = ({
  title,
  sceneScript,
  keyIndex,
  showRemove,
  showAddDialogue = true,
  onRemove,
  onAdd,
  onTextChange,
  onTitleChange,
  isEditable = false,
  onParaphrase
}) => {
  const [text, setText] = useState(sceneScript);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isParaphrasing, setIsParaphrasing] = useState(false); // New state for loading

  const [isTitleEditMode, setIsTitleEditMode] = useState(false); // To manage edit mode of the title
  const [editedTitle, setEditedTitle] = useState(title); // Store the title's value

  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  // const mainBody = useSelector((state) => state.script.script.mainBody);

  const textBoxRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(sceneScript);
  }, [sceneScript]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isInEditMode && textareaRef.current) {
      // Set initial focus
      textareaRef.current.focus();

      // Adjust height after a small delay to ensure accurate measurement
      setTimeout(() => adjustHeight(), 10);
    }
  }, [isInEditMode]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the actual scrollHeight
      textareaRef.current.style.height = 'auto';

      // Set to scrollHeight with a minimum value to prevent collapse
      const newHeight = Math.max(textareaRef.current.scrollHeight, 100);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    adjustHeight();
  };

  const handleRemoveDialogue = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const handleAddDialogue = () => {
    console.log('add dialogue');
    if (onAdd) {
      onAdd();
    }
  };

  const testHandler = () => {
    setTimeout(() => {
      setIsInEditMode(false);
    }, 100);
  };

  // const handleTitleChange = (e) => {
  //   setEditedTitle(e.target.value); // Update the title as the user types
  // };
  // const saveTitle = () => {
  //   setIsTitleEditMode(false); // Exit edit mode
  //   if (onTitleChange) {
  //     onTitleChange(editedTitle); // Call the onTitleChange handler from the parent
  //   }
  // };

  const handleParaphrase = async (text) => {
    console.log('paraphrase');
    setIsParaphrasing(true); // Start loading

    try {
      console.log('Sending request to API...');

      const response = await fetch('https://llm.srv.webis.de/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'default:latest',
          prompt: `Paraphrase the following dialogue to preserve its meaning but rewrite it in different words. Keep it natural, short and conversational:\n\n${text}`,
          stream: false
        })
      });

      const data = await response.json();
      console.log('Paraphrase response received:', data);

      const paraphrasedText = data.response?.trim();

      // Update the state with the paraphrased text
      if (paraphrasedText) {
        setText(paraphrasedText); // Update local state with paraphrased text

        // Call `onTextChange` to notify the parent component with the new text
        if (onTextChange) {
          onTextChange(paraphrasedText, keyIndex); // Update parent state via onTextChange
        }
      }
      // setParaphrased(data.response.trim());
    } catch (error) {
      console.error('Error talking to Ollama:', error);
      alert('Failed to paraphrase. See console for details.');

      // setParaphrased('Failed to connect to Ollama.');
    } finally {
      console.log('Paraphrasing complete, turning off loading...');
      setIsParaphrasing(false); // End loading regardless of success or failure
    }
  };

  // Render loading button or normal button based on state
  const renderParaphraseButton = () => {
    if (isParaphrasing) {
      return (
        <button className="paraphrase-btn loading" disabled>
          <div className="loading-spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </button>
      );
    }

    return (
      <button className="paraphrase-btn" onClick={() => handleParaphrase(text)}>
        Paraphrase
      </button>
    );
  };

  return (
    <section className="story-section">
      {isTitleEditMode ? (
        <input
          type="text"
          value={editedTitle} // Use the state value
          // onChange={handleTitleChange} // Update title as the user types
          // onBlur={saveTitle} // Save title when the input loses focus
          // autoFocus
          // className="section-title-edit" // Add a class for styling

          onChange={(e) => setEditedTitle(e.target.value)} // Update state on text change
          onBlur={() => {
            setIsTitleEditMode(false); // Exit edit mode on blur (click outside)
            if (onTitleChange) {
              onTitleChange(editedTitle); // Pass updated title to parent (via callback)
            }
          }}
          autoFocus
          className="section-title-edit" // Add a class for styling
        />
      ) : (
        <h2
          className="section-title"
          onClick={() => isEditable && setIsTitleEditMode(true)} // Enable edit mode on click
        >
          {editedTitle}
        </h2>
      )}
      {isInEditMode ? (
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={(e) => {
              onTextChange(e.target.value, keyIndex);
              testHandler();
            }}
            className="story-text-editor"
          />
          <div className="dialogue-actions">
            {renderParaphraseButton()}

            {showAddDialogue && (
              <button className="add-dialogue-btn" aria-label="Add a new dialogue" onClick={handleAddDialogue}>
                Add Dialogue
              </button>
            )}
            {showRemove && (
              <button className="remove-btn" onClick={handleRemoveDialogue}>
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <p ref={textBoxRef} className="story-text" onClick={() => setIsInEditMode(true)}>
          {text}
        </p>
      )}
    </section>
  );
};

export default ContentBox;
