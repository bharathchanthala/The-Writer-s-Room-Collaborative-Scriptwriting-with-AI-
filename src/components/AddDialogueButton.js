import React from 'react';

const AddDialogueButton = ({
  index,
  isInEditMode,
  activeDialogue,
  onAddDialogue,
  onRemoveDialogue,
  onSave,
  onClose,
}) => {
  const isActive = activeDialogue === index;

  return (
    <div className="dialogue-actions">
      {isActive && !isInEditMode && (
        <>
          <button
            type="button"
            onClick={() => onAddDialogue(index)}
          >
            Add Dialogue
          </button>

          <button
            type="button"
            onClick={() => onRemoveDialogue(index)}
          >
            Remove
          </button>
        </>
      )}

      {isInEditMode && (
        <>
          <button
            type="button"
            onClick={() => onSave(index)}
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => onClose(index)}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default AddDialogueButton;