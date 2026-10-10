import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Button } from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import { ChevronLeft, Copy, Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../assets/titlelogo.png';
import AddDialogueButton from '../components/AddDialogueButton';
import ContentBox from '../components/ContentBox';

import {
  updateMainBody,
  updateInitialSceneHeading,
  updateInitialStory,
  updateEndingSceneHeading,
  updateEndingScene,
  undoMainBody,
  redoMainBody,
} from '../stores/stores';

import './Write.css';


const countWords = (text) => {
  if (!text) return 0;

  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .length;
};


const Write = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState('');
  const [charText, setCharText] = useState('');
  const [activeDialogue, setActiveDialogue] = useState(null);

  const {
    initialSceneHeading,
    initial_story,
    characters,
    // conversation,
    endingSceneHeading,
    endingSceneDescription,
    mainBody,
    versions,
    currentVersion,
  } = useSelector((state) => state.script);


  // Close active dialogue when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dialogue-text-wrapper')) {
        setActiveDialogue(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  // Scroll to latest dialogue
  useEffect(() => {
    const lastDialogue = document.querySelector(
      '.dialogue-line:last-child'
    );

    if (lastDialogue) {
      lastDialogue.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [mainBody]);


  // Remove dialogue
  const handleRemoveDialogue = (index, showConfirmDialog = false) => {
    if (!showConfirmDialog) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this dialogue?'
      );

      if (!confirmed) return;
    }

    const updatedMainBody = mainBody.filter(
      (_, idx) => idx !== index && idx !== index + 1
    );

    dispatch(updateMainBody(updatedMainBody));
  };


  // Remove scene
  const handleRemoveScene = (index, showConfirmDialog = false) => {
    if (!showConfirmDialog) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this scene?'
      );

      if (!confirmed) return;
    }

    const updatedMainBody = mainBody.filter(
      (_, idx) => idx !== index
    );

    dispatch(updateMainBody(updatedMainBody));
  };


  // Download screenplay
  const generateScriptText = () => {
    let content = '';

    content += `${initialSceneHeading || 'Opening'}:\n`;
    content += `${initial_story || ''}\n\n`;

    for (let i = 0; i < mainBody.length; i++) {
      const item = mainBody[i];

      if (item.label === 'Narrative') {
        content += `SCENE:\n${item.text || ''}\n\n`;
      }

      if (
        item.label === 'Character_Name' &&
        mainBody[i + 1]?.label === 'Dialogue'
      ) {
        content += `${item.text || ''}: ${
          mainBody[i + 1]?.text || ''
        }\n\n`;
      }
    }

    content += `${endingSceneHeading || 'Ending'}:\n`;
    content += `${endingSceneDescription || ''}\n`;

    return content;
  };


  const handleDownload = () => {
    const content = generateScriptText();

    const blob = new Blob(
      [content],
      { type: 'text/plain' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'script.txt';

    a.click();

    URL.revokeObjectURL(url);
  };


  const handleCopy = () => {
    const content = generateScriptText();

    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log('Script copied to clipboard!');
      })
      .catch((error) => {
        console.error(
          'Failed to copy script:',
          error
        );
      });
  };


  // Add new dialogue
  const handleAddDialogue = (index) => {
    const updatedMainBody = cloneDeep(mainBody);

    const character = {
      label: 'Character_Name',
      text: '',
      isInEditMode: true,
    };

    const dialogue = {
      label: 'Dialogue',
      text: '',
      placeholder: 'Type your dialogue here...',
    };

    updatedMainBody.splice(
      index + 2,
      0,
      character
    );

    updatedMainBody.splice(
      index + 3,
      0,
      dialogue
    );

    setActiveDialogue(index + 2);

    dispatch(updateMainBody(updatedMainBody));
  };


  // Update speaker
  const updateDialogueSpeaker = (
    index,
    charName
  ) => {
    const updatedMainBody = cloneDeep(mainBody);

    if (!updatedMainBody[index]) return;

    updatedMainBody[index].text = charName;

    setSelectedChar(charName);
  };


  // Update dialogue text
  const dialogueContentChangeHandler = (
    index,
    content,
    isInEditMode
  ) => {
    const updatedMainBody = cloneDeep(mainBody);

    if (!updatedMainBody[index + 1]) return;

    updatedMainBody[index + 1].text = content;

    setCharText(content);

    if (!isInEditMode) {
      dispatch(updateMainBody(updatedMainBody));
    }
  };


  // Save newly added dialogue
  const saveNewDialogHandler = (index) => {
    const updatedMainBody = cloneDeep(mainBody);

    if (!selectedChar) {
      window.alert(
        'Select the speaker, it is mandatory before saving'
      );

      return;
    }

    if (!updatedMainBody[index]) return;

    updatedMainBody[index].text = selectedChar;

    if (updatedMainBody[index + 1]) {
      updatedMainBody[index + 1].text = charText;
    }

    updatedMainBody[index].isInEditMode = false;

    dispatch(updateMainBody(updatedMainBody));

    setSelectedChar('');
    setCharText('');
  };


  // Main scene text change
  const onSceneTextChange = (
    newText,
    index
  ) => {
    const updatedMainBody = cloneDeep(mainBody);

    if (!updatedMainBody[index]) return;

    updatedMainBody[index].text = newText;

    dispatch(updateMainBody(updatedMainBody));
  };


  // Opening scene
  const onOpeningSceneTitleChange = (
    newTitle
  ) => {
    dispatch(
      updateInitialSceneHeading(newTitle)
    );
  };


  const onOpeningSceneTextChange = (
    newText
  ) => {
    dispatch(
      updateInitialStory(newText)
    );
  };


  // Ending scene
  const onClosingSceneTitleChange = (
    newTitle
  ) => {
    dispatch(
      updateEndingSceneHeading(newTitle)
    );
  };


  const onEndingSceneTextChange = (
    newText
  ) => {
    dispatch(
      updateEndingScene(newText)
    );
  };


  return (
    <div
      className={`write-page ${
        isSidebarOpen ? 'menu-open' : ''
      }`}
    >

      {/* Header */}
      <div className="header">

        <button
          className="hamburger"
          onClick={() =>
            setIsSidebarOpen(
              !isSidebarOpen
            )
          }
        >
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>

        <div className="logo">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
            />
          </Link>
        </div>

      </div>


      <div className="content-wrapper">

        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="sidebar">

            <button
              onClick={() =>
                navigate('/settings')
              }
              className="back-button"
            >
              <ChevronLeft className="back-icon" />
              Back to Settings
            </button>

          </aside>
        )}


        {/* Character summary + Undo/Redo */}
        <div
          className={`summary-block fixed-summary ${
            isSidebarOpen
              ? 'with-sidebar'
              : ''
          }`}
        >

          <div className="summary-header">

            <h2>Character Summary</h2>

            {characters.map(
              (character, index) => (
                <p key={index}>
                  <strong>
                    Character {index + 1}:
                  </strong>{' '}
                  {character.name}
                  {character.trait
                    ? `, ${character.trait}`
                    : ''}
                </p>
              )
            )}

          </div>


          <div className="undo-redo-buttons fixed-undo-redo">

            <Button
              variant="contained"
              className="custom-undo-button"
              startIcon={<UndoIcon />}
              onClick={() =>
                dispatch(
                  undoMainBody()
                )
              }
              disabled={
                currentVersion <= 0
              }
            >
              Undo
            </Button>


            <Button
              variant="contained"
              className="custom-redo-button"
              endIcon={<RedoIcon />}
              onClick={() =>
                dispatch(
                  redoMainBody()
                )
              }
              disabled={
                currentVersion >=
                versions.length - 1
              }
            >
              Redo
            </Button>

          </div>

        </div>


        {/* Main content */}
        <main
          className={`main-content ${
            isSidebarOpen
              ? 'sidebar-open'
              : ''
          }`}
        >

          <div className="script-container">

            <h1 className="script-title">
              Heading
            </h1>


            {/* Opening Scene */}
            <ContentBox
              title={initialSceneHeading}
              sceneScript={initial_story}
              onAdd={() =>
                handleAddDialogue(-2)
              }
              onTextChange={
                onOpeningSceneTextChange
              }
              onTitleChange={
                onOpeningSceneTitleChange
              }
              isEditable={true}
            />


            {/* Main Body */}
            {mainBody?.map(
              (mb, index) => {

                // Narrative
                if (
                  mb.label ===
                  'Narrative'
                ) {
                  return (
                    <ContentBox
                      key={index}
                      title="Scene"
                      sceneScript={mb.text}
                      keyIndex={index}
                      showRemove={true}
                      onAdd={() =>
                        handleAddDialogue(
                          index - 1
                        )
                      }
                      onTextChange={(
                        value
                      ) =>
                        onSceneTextChange(
                          value,
                          index
                        )
                      }
                      onRemove={() =>
                        handleRemoveScene(
                          index,
                          true
                        )
                      }
                    />
                  );
                }


                // Dialogue
                if (
                  mb.label ===
                  'Character_Name'
                ) {
                  const next =
                    mainBody[
                      index + 1
                    ];

                  return (
                    <section
                      key={index}
                      className="dialogue-section"
                    >

                      <h6 className="section-title dialogue-section">
                        Dialogue
                      </h6>


                      <div className="dialogue-line">

                        <span className="speaker-name">

                          {!mb.isInEditMode && (
                            <span className="speaker-name">
                              <span>
                                {mb.text}:
                              </span>
                            </span>
                          )}


                          {mb.isInEditMode && (
                            <span className="speaker-name">

                              <select
                                value={
                                  mb.text ||
                                  selectedChar ||
                                  ''
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateDialogueSpeaker(
                                    index,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select Character
                                </option>

                                {characters.map(
                                  (
                                    char,
                                    idx
                                  ) => (
                                    <option
                                      key={
                                        idx
                                      }
                                      value={
                                        char.name
                                      }
                                    >
                                      {
                                        char.name
                                      }
                                    </option>
                                  )
                                )}

                              </select>

                            </span>
                          )}

                        </span>


                        {next?.label ===
                          'Dialogue' && (
                          <span className="dialogue-text">

                            <div
                              className={`dialogue-text-wrapper ${
                                mb.isInEditMode
                                  ? 'is-in-edit-mode'
                                  : ''
                              } ${
                                index ===
                                activeDialogue
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();

                                setActiveDialogue(
                                  index
                                );
                              }}
                            >

                              <div
                                contentEditable
                                className={`dialogue-text no-scroll ${
                                  mb.isInEditMode
                                    ? 'edit-mode'
                                    : ''
                                } ${
                                  activeDialogue ===
                                  index
                                    ? 'active'
                                    : ''
                                }`}
                                suppressContentEditableWarning={
                                  true
                                }
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setActiveDialogue(
                                    index
                                  );
                                }}
                                onBlur={(e) =>
                                  dialogueContentChangeHandler(
                                    index,
                                    e.currentTarget
                                      .innerText,
                                    mb.isInEditMode
                                  )
                                }
                              >
                                {next.text}
                              </div>


                              <AddDialogueButton
                                index={index}
                                isInEditMode={
                                  mb.isInEditMode
                                }
                                activeDialogue={
                                  activeDialogue
                                }
                                onAddDialogue={
                                  handleAddDialogue
                                }
                                onRemoveDialogue={
                                  handleRemoveDialogue
                                }
                                onSave={
                                  saveNewDialogHandler
                                }
                                onClose={(
                                  index
                                ) =>
                                  handleRemoveDialogue(
                                    index,
                                    true
                                  )
                                }
                                dispatch={
                                  dispatch
                                }
                                mainBody={
                                  mainBody
                                }
                              />

                            </div>

                          </span>
                        )}

                      </div>

                    </section>
                  );
                }

                return null;
              }
            )}


            {/* Ending Scene */}
            <ContentBox
              title={
                endingSceneHeading
              }
              sceneScript={
                endingSceneDescription
              }
              showAddDialogue={
                false
              }
              onTextChange={
                onEndingSceneTextChange
              }
              onTitleChange={
                onClosingSceneTitleChange
              }
              isEditable={true}
            />


            {/* Actions */}
            <div className="action-buttons">

              <button
                className="download-button"
                onClick={
                  handleDownload
                }
              >
                <Download size={18} />
                Download Script
              </button>


              <button
                className="copy-button"
                onClick={handleCopy}
              >
                <Copy size={18} />
                Copy to Clipboard
              </button>


              <div className="word-count">
                Total Words:{' '}
                {
                  countWords(
                    initial_story
                  ) +
                  mainBody.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      countWords(
                        item.text
                      ),
                    0
                  ) +
                  countWords(
                    endingSceneDescription
                  )
                }
              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};


export default Write;