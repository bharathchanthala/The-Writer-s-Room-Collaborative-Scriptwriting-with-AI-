import React, { useState } from 'react';
import { updateMainBody } from '../stores/stores';
import cloneDeep from 'lodash/cloneDeep';


const handleParaphrase = async (index, originalText, dispatch, mainBody) => {
  console.log('paraphrase');
  try {
    const response = await fetch('https://llm.srv.webis.de/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'default:latest',
        prompt: `"Paraphrase the following sentence into a single alternative that preserves its meaning and tone. Keep it short, natural, and conversational. The output should be only one sentence of similar length ,don’t include any suggestions or explainations:\n\n${originalText}`,
        stream: false,
      }),
    });

    const data = await response.json();
    const newText = data.response?.trim();

    if (newText && mainBody[index + 1]?.label === 'Dialogue') {
      // Make a deep copy of the mainBody to avoid mutation of Redux state
      const updatedMainBody = cloneDeep(mainBody); // deep copy of the mainBody
      updatedMainBody[index + 1].text = newText;

      // Dispatch the action to update the mainBody in Redux store
      dispatch(updateMainBody(updatedMainBody)); // ✅ dispatch the updated mainBody
    }
  } catch (error) {
    console.error('Error in paraphrase:', error);
  }
};

const AddDialogueButton = ({
  index,
  isInEditMode,
  activeDialogue,
  onAddDialogue,
  onCoWriteClick,
  onRemoveDialogue,
  onGenerateWithAI,
  onSave,
  onClose,
  dispatch,
  mainBody
}) => {
  // const [paraphrasedText, setParaphrased] = useState('');

  return (
    <>
      {!isInEditMode && activeDialogue === index && (
        <div className="dialogue-actions">
          <button className="paraphrase-btn" onClick={() => handleParaphrase(index, mainBody[index + 1]?.text || '', dispatch, mainBody)}>
            Paraphrase
          </button>
          <button
            className="add-dialogue-btn"
            aria-label="Add a new dialogue"
            onClick={() => onAddDialogue(index)}
          >
            Add Dialogue
          </button>
          {/* <button className="cowrite-btn" onClick={() => onCoWriteClick(index)}>
            Co-Write
          </button> */}
          <button className="remove-btn" onClick={() => onRemoveDialogue(index)}>
            Remove
          </button>
        </div>
      )}
      {isInEditMode && (
        <div className="dialogue-actions">
          {/* <button onClick={onGenerateWithAI}>Generate with AI</button> */}
          <button onClick={() => onSave(index)}>Save</button>
          <button onClick={() => onClose(index)}>Close</button>
        </div>
      )}

      {/* Display the paraphrased text */}
      {/* {paraphrasedText && (
        <div className="paraphrased-text">
          <p>{paraphrasedText}</p>
        </div>
      )} */}
    </>
  );
};

export default AddDialogueButton;
