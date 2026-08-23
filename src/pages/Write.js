import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Button } from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import { ChevronLeft, Copy, Download } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/titlelogo.png';
import AddDialogueButton from '../components/AddDialogueButton';
import ContentBox from '../components/ContentBox';
import {
  redoMainBody,
  undoMainBody,
  updateEndingScene,
  updateEndingSceneHeading,
  // updateInitialStory,
  updateMainBody,
  updateOpeningSceneHeading,
  updateOpeningSceneText
} from '../stores/stores';
import './Write.css';

// First, add this function after your existing imports
const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

const Write = () => {
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState('');
  const [charText, setCharText] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [hasInserted, setHasInserted] = useState(false);

  const openingSceneScript = useSelector((state) => state.script);
  // TOOD: update this variable naming later
  const intialSceneHeading = useSelector((state) => state.script.initialSceneHeading);
  const charactersFromStore = useSelector((state) => state.script.characters);
  const dialogueScript = useSelector((state) => state.script.conversation);
  // const sceneScript = useSelector((state) => state.script.scene);
  const endingSceneHeading = useSelector((state) => state.script.endingSceneHeading);
  const closingSceneScript = useSelector((state) => state.script.endingSceneDescription);
  // const mainBody = useSelector((state) => state.script.mainBodyVersions[state.script.currentMainBodyVersion]
  // );
  const mainBodyVersions = useSelector((state) => state.script.mainBodyVersions);
  const currentMainBodyVersion = useSelector((state) => state.script.currentMainBodyVersion);

  const mainBody = useMemo(() => {
    return mainBodyVersions[currentMainBodyVersion] || [];
  }, [mainBodyVersions, currentMainBodyVersion]);

  const { script = {}, characters = [] } = location.state || {};
  const [editableDialogues, setEditableDialogues] = useState(script.conversation || []);

  const [, forceRender] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    forceRender((prev) => prev + 1);
  }, [mainBody]);

  // const mainBodyVersions = useSelector((state) => state.script.mainBodyVersions);
  // const currentMainBodyVersion = useSelector((state) => state.script.currentMainBodyVersion);

  // const handleTitleChange = (newTitle) => {
  //   // Update the state or store with the new title
  //   dispatch(updateInitialStory(newTitle));
  // };

  const handleFinishCoWrite = useCallback(
    (insertIndex, newConversation) => {
      console.log('Before update - Dialogues:', editableDialogues);
      console.log('New conversation received:', newConversation, 'Insert index:', insertIndex);

      const updatedDialogues = [
        ...editableDialogues.slice(0, insertIndex + 1),
        ...(newConversation || []),
        ...editableDialogues.slice(insertIndex + 1)
      ];

      setEditableDialogues(updatedDialogues);
      console.log('After update - Dialogues:', updatedDialogues);
    },
    [editableDialogues]
  );

  useEffect(() => {
    if (!hasInserted && location.state?.newConversation && location.state?.insertIndex !== undefined) {
      handleFinishCoWrite(location.state.insertIndex, location.state.newConversation);

      setHasInserted(true); // Mark as inserted to prevent re-insertion

      // Clear the newConversation and insertIndex from the state
      navigate('.', { replace: true, state: { script, characters } });
    } else {
      console.log('No new conversation data found, keeping existing dialogues.');
    }
  }, [location, navigate, handleFinishCoWrite, hasInserted, script, characters]);

  useEffect(() => {
    // Run this only on the initial mount
    const shouldLoadFromStorage = !script.initial_story || !script.follow_up_story;

    if (shouldLoadFromStorage) {
      const storedScript = localStorage.getItem('scriptData');

      if (storedScript) {
        try {
          const parsedScript = JSON.parse(storedScript);

          if (parsedScript.conversation && Array.isArray(parsedScript.conversation)) {
            setEditableDialogues(parsedScript.conversation); // Load dialogues from storage
          } else {
            console.warn('Invalid script data in localStorage. Resetting...');
            localStorage.removeItem('scriptData');
          }
        } catch (error) {
          console.error('Failed to parse scriptData from localStorage:', error);
          localStorage.removeItem('scriptData');
        }
      }
    }
  }, [script.initial_story, script.follow_up_story]); // Empty dependency array to run only on initial mount

  const memoizedScript = useMemo(() => script, [script]);

  useEffect(() => {
    const scriptDataToStore = {
      ...memoizedScript,
      conversation: editableDialogues
    };
    localStorage.setItem('scriptData', JSON.stringify(scriptDataToStore));
  }, [editableDialogues, memoizedScript]);

  // const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState(null);
  // const [newDialogue, setNewDialogue] = useState({ speaker: '', content: '' });
  // const [isAddingDialogue, setIsAddingDialogue] = useState(false);
  // const [isAddingDialogueIndex, setIsAddingDialogueIndex] = useState(null);

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

  useEffect(() => {
    const lastDialogue = document.querySelector('.dialogue-line:last-child');
    if (lastDialogue) {
      lastDialogue.scrollIntoView({ behavior: 'smooth' });
    }
  }, [editableDialogues]);

  // const handleDialogueChange = (index, value) => {
  //   const updatedDialogues = [...editableDialogues];
  //   updatedDialogues[index].content = value;
  //   setEditableDialogues(updatedDialogues);
  //   setShowSaveMessage(true);
  //   setTimeout(() => setShowSaveMessage(false), 2000);
  // };

  const handleRemoveDialogue = (index, showConfirmDialog = false) => {
    console.log('remove scene: ', index);
    // TOOD: remove duplicate code
    if (showConfirmDialog) {
      const filteredDialogueScript = mainBody.filter((ds, idx) => idx !== index);
      const test = filteredDialogueScript.filter((ds, idx) => idx !== index);
      dispatch(updateMainBody(test));

      return;
    }

    if (window.confirm('Are you sure you want to delete this dialogue?')) {
      const filteredDialogueScript = mainBody.filter((ds, idx) => idx !== index);
      const test = filteredDialogueScript.filter((ds, idx) => idx !== index);
      dispatch(updateMainBody(test));
    }
  };

  const handleRemoveScene = (index, showConfirmDialog = false) => {
    console.log('remove scene: ', index);
    // TOOD: remove duplicate code
    if (showConfirmDialog) {
      // TODO: improve this
      const filteredDialogueScript = mainBody.filter((ds, idx) => idx !== index);
      dispatch(updateMainBody(filteredDialogueScript));

      return;
    }

    if (window.confirm('Are you sure you want to delete this dialogue?')) {
      const filteredDialogueScript = mainBody.filter((ds, idx) => idx !== index);
      dispatch(updateMainBody(filteredDialogueScript));
    }
  };

  const handleCoWriteClick = (index) => {
    if (!dialogueScript || !Array.isArray(dialogueScript)) {
      console.error('dialogueScript is undefined or not an array.');
      return;
    }

    if (index < 0 || index >= dialogueScript.length) {
      console.error('Invalid index for conversation:', index);
      return;
    }

    const selectedText = dialogueScript[index]?.content || ''; // Ensure selection exists

    navigate('/co-write', {
      state: {
        script: { ...script, conversation: editableDialogues },
        characters,
        selectedText, // Pass the selected text to CoWrite
        insertIndex: index
      }
    });
  };

  const generateScriptText = () => {
    let content = '';

    // Opening Scene with Heading
    content += `${intialSceneHeading || 'Opening'}:\n`;
    content += `${openingSceneScript?.initial_story || ''}\n\n`;

    // Main Body: Scenes and Dialogues
    for (let i = 0; i < mainBody.length; i++) {
      const item = mainBody[i];

      if (item.label === 'Narrative') {
        content += `SCENE :\n${item.text}\n\n`;
      }

      if (item.label === 'Character_Name' && mainBody[i + 1]?.label === 'Dialogue') {
        content += `${item.text}: ${mainBody[i + 1].text}\n\n`;
      }
    }

    // Ending Scene with Heading
    content += `${endingSceneHeading || 'Ending'}:\n`;
    content += `${closingSceneScript || script.follow_up_story || ''}\n`;

    return content;
  };

  // const handleParaphrase = async (index, sceneText, sceneType) => {
  //   console.log('yes it is working')
  //   try {
  //     const response = await fetch('https://llm.srv.webis.de/api/generate', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         model: 'default:latest',
  //         prompt: `Paraphrase the following dialogue to preserve its meaning but rewrite it in different words. Keep it natural, short, and conversational:\n\n${sceneText}`,
  //         stream: false,
  //       }),
  //     });

  //     const data = await response.json();
  //     const paraphrasedText = data.response?.trim();

  //     console.log('paraphrasedText:', paraphrasedText)

  //     if (paraphrasedText) {
  //       // Update the main body with the paraphrased text based on the scene type
  //       const updatedMainBody = cloneDeep(mainBody);

  //       if (sceneType === 'opening') {
  //         if (updatedMainBody[0]) {
  //           updatedMainBody[0].text = paraphrasedText;
  //         }
  //         // updatedMainBody[0].text = paraphrasedText; // Assuming the opening scene is the first item in mainBody
  //       } else if (sceneType === 'closing') {
  //         const lastIndex = updatedMainBody.length - 1;
  //       if (updatedMainBody[lastIndex]) {
  //         updatedMainBody[lastIndex].text = paraphrasedText;
  //       }
  //         // updatedMainBody[updatedMainBody.length - 1].text = paraphrasedText; // Assuming the closing scene is the last item in mainBody
  //       } else {
  //         if (updatedMainBody[index]) {
  //         updatedMainBody[index].text = paraphrasedText;
  //       }
  //     }

  //       dispatch(updateMainBody(updatedMainBody)); // Dispatch to update the store
  //     }
  //   } catch (error) {
  //     console.error('Error paraphrasing text:', error);
  //   }
  // };

  const handleDownload = () => {
    const content = generateScriptText();
    const blob = new Blob([content], { type: 'text/plain' });
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
      .then(() => console.log('Script copied to clipboard!'))
      .catch((err) => console.error('Failed to copy script:', err));
  };

  const handleAddDialogue = (index) => {
    console.log('index: ', index);
    const test = cloneDeep(mainBody);
    const test1 = {
      label: 'Character_Name',
      text: '',
      isInEditMode: true
    };

    const test2 = {
      label: 'Dialogue',
      text: '',
      placeholder: 'Type your dialogue here...' // Add placeholder text
    };

    test.splice(index + 2, 0, test1);
    test.splice(index + 3, 0, test2);

    // Set the active dialogue to the new one
    setActiveDialogue(index + 2);

    dispatch(updateMainBody(test));
  };

  const updateDialogueSpeaker = (index, charName) => {
    // TODO: rename the below variable later
    const test = cloneDeep(mainBody);
    test[index].text = charName;
    setSelectedChar(charName);

    // dispatch(updateMainBody(test));
  };

  const dialogueContentChangeHandler = (index, content, isInEditMode) => {
    const test = cloneDeep(mainBody);
    test[index + 1].text = content;
    setCharText(content);
    if (!isInEditMode) {
      dispatch(updateMainBody(test));
    }
  };

  const saveNewDialogHandler = (index) => {
    const test = cloneDeep(mainBody);

    if (!selectedChar) {
      window.alert('Select the speaker, it is mandatory before saving');
      return;
    }

    test[index].text = selectedChar;
    test[index + 1].text = charText;
    test[index].isInEditMode = false;
    dispatch(updateMainBody(test));

    setSelectedChar('');
    setCharText('');
  };

  // const handleSaveNewDialogue = () => {
  //   if (newDialogue.speaker && newDialogue.content) {
  //     const updatedDialogues = [
  //       ...editableDialogues.slice(0, isAddingDialogueIndex + 1),
  //       newDialogue,
  //       ...editableDialogues.slice(isAddingDialogueIndex + 1)
  //     ];
  //     setEditableDialogues(updatedDialogues);
  //     setNewDialogue({ speaker: '', content: '' });
  //     setIsAddingDialogueIndex(null);
  //   }
  // };

  // const handleGenerateWithAI = () => {
  //   setNewDialogue({
  //     ...newDialogue,
  //     content: 'Generated dialogue from AI...'
  //   });
  // };

  // const onOpeningSceneTextChange = (value) => {
  //   dispatch(updateInitialStory(value));
  // };

  const onEndingSceneTextChange = (value) => {
    dispatch(updateEndingScene(value));
  };

  const onSceneTextChange = (newText, index) => {
    // console.log('newText: ', newText);
    // console.log('newTextIndex: ', index);
    const updatedMainBody = cloneDeep(mainBody);
    if (updatedMainBody[index]) {
      updatedMainBody[index].text = newText; // Update the text property if object exists
      dispatch(updateMainBody(updatedMainBody)); // Dispatch the updated state
    } else {
      console.error(`No object found at index ${index}`); // Log an error if index doesn't exist
    }
    // const onTextChange = (updatedText, index) => {
    //   // Create a copy of mainBody and update the relevant text
    //   const updatedMainBody = [...mainBody];
    //   updatedMainBody[index].text = updatedText;

    //   // Dispatch the updated main body to Redux store
    //   dispatch(updateMainBody(updatedMainBody));
    // };

    // const test = cloneDeep(mainBody);
    // test[index].text = value;
    // dispatch(updateMainBody(test));
  };

  const onOpeningSceneTitleChange = (newTitle) => {
    const _mainBody = cloneDeep(mainBody);

    _mainBody.forEach((mb) => {
      if (mb.label === 'openingScene') {
        mb.heading = newTitle;
      }
    });

    dispatch(updateMainBody(_mainBody));
  };

  const onOpeningSceneTextChange = (newText) => {
    const _mainBody = cloneDeep(mainBody);

    _mainBody.forEach((mb) => {
      if (mb.label === 'openingScene') {
        mb.text = newText;
      }
    });

    dispatch(updateMainBody(_mainBody));
  };

  const onClosingSceneTitleChange = (newTitle) => {
    const _mainBody = cloneDeep(mainBody);

    _mainBody.forEach((mb) => {
      if (mb.label === 'closingScene') {
        mb.heading = newTitle;
      }
    });

    dispatch(updateMainBody(_mainBody));
  };

  const onClosingSceneTextChange = (newText) => {
    console.log('newText: ', newText);
    const _mainBody = cloneDeep(mainBody);

    _mainBody.forEach((mb) => {
      if (mb.label === 'closingScene') {
        mb.text = newText;
      }
    });

    dispatch(updateMainBody(_mainBody));
  };

  const getOpeningSceneHeading = () => {
    return mainBody.filter((mb) => mb.label === 'openingScene')?.[0]?.heading;
  };

  const getOpeningSceneText = () => {
    return mainBody.filter((mb) => mb.label === 'openingScene')?.[0]?.text;
  };

  const getClosingSceneHeading = () => {
    return mainBody.filter((mb) => mb.label === 'closingScene')?.[0]?.heading;
  };

  const getClosingSceneText = () => {
    return mainBody.filter((mb) => mb.label === 'closingScene')?.[0]?.text;
  };

  // console.log("Current dialogues in Write.js:", editableDialogues);

  return (
    <div className={`write-page ${isSidebarOpen ? 'menu-open' : ''}`}>
      <div className="header">
        <button className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
      </div>

      <div className="content-wrapper">
        {isSidebarOpen && (
          <aside className="sidebar">
            <button onClick={() => navigate('/settings')} className="back-button">
              <ChevronLeft className="back-icon" />
              Back to Settings
            </button>
          </aside>
        )}

        <div className={`summary-block fixed-summary ${isSidebarOpen ? 'with-sidebar' : ''}`}>
          <div className="summary-header">
            <h2>Character Summary</h2>
            {charactersFromStore.map((character, index) => (
              <p key={index}>
                <strong>Character {index + 1}:</strong> {character.name} , {character.trait}
              </p>
            ))}
          </div>

          <div className="undo-redo-buttons fixed-undo-redo">
            <Button
              variant="contained"
              className="custom-undo-button"
              startIcon={<UndoIcon />}
              onClick={() => dispatch(undoMainBody())}
              disabled={currentMainBodyVersion <= 0}
            >
              Undo
            </Button>
            <Button
              variant="contained"
              className="custom-redo-button"
              endIcon={<RedoIcon />}
              onClick={() => dispatch(redoMainBody())}
              disabled={currentMainBodyVersion >= mainBodyVersions.length - 1}
            >
              Redo
            </Button>
          </div>
        </div>

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="script-container">
            <h1 className="script-title">Heading</h1>

            <ContentBox
              title={mainBody.filter((mb) => mb.label === 'openingScene')?.[0]?.heading}
              sceneScript={mainBody.filter((mb) => mb.label === 'openingScene')?.[0]?.text}
              onAdd={() => handleAddDialogue(-2)}
              onTextChange={onOpeningSceneTextChange} // Pass the function
              onTitleChange={onOpeningSceneTitleChange}
              isEditable={true} // Make the title editable
              // onParaphrase={(text) => handleParaphrase(0, text, 'opening')}
            />

            {mainBody?.map((mb, index) => {
              if (mb.label === 'Narrative') {
                return (
                  <ContentBox
                    key={index}
                    title="Scene"
                    sceneScript={mb.text}
                    keyIndex={index}
                    showRemove={true}
                    onAdd={() => handleAddDialogue(index - 1)}
                    onTextChange={(value) => onSceneTextChange(value, index)}
                    onRemove={() => handleRemoveScene(index, true)}
                    // onParaphrase={(text) => handleParaphrase(mainBody.length - 1, text)}
                  />
                );
              }

              if (mb.label === 'Character_Name') {
                const next = mainBody[index + 1];
                return (
                  <section key={index} className="dialogue-section">
                    <h6 className="section-title dialogue-section">Dialogue</h6>
                    <div className="dialogue-line">
                      <span className="speaker-name">
                        {!mb.isInEditMode && (
                          <span className="speaker-name">
                            <span>{mb.text}:</span>
                          </span>
                        )}

                        {mb.isInEditMode && (
                          <span className="speaker-name">
                            <select onChange={(e) => updateDialogueSpeaker(index, e.target.value)}>
                              <option value="">Select Character</option>
                              {charactersFromStore.map((char, idx) => (
                                <option key={idx} value={char.name}>
                                  {char.name}
                                </option>
                              ))}
                            </select>
                          </span>
                        )}
                      </span>
                      {next?.label === 'Dialogue' && (
                        <span className="dialogue-text">
                          <div
                            className={`dialogue-text-wrapper ${mb.isInEditMode ? 'is-in-edit-mode' : ''} ${
                              index === activeDialogue ? 'active' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDialogue(index);
                            }}
                          >
                            <div
                              contentEditable
                              className={`dialogue-text no-scroll ${mb.isInEditMode ? 'edit-mode' : ''} ${
                                activeDialogue === index ? 'active' : ''
                              }`}
                              suppressContentEditableWarning={true}
                              onClick={(e) => {
                                // Clear placeholder on click if empty
                                if (!next.text) {
                                  e.currentTarget.innerText = '';
                                }
                                e.stopPropagation();
                                setActiveDialogue(index);
                              }}
                              onBlur={(e) => dialogueContentChangeHandler(index, e.target.innerText, mb.isInEditMode)}
                            >
                              {next.text}
                              {/* {next.text ? (
                                <span>{next.text}</span>
                              ) : (
                                <span className="placeholder">{next.placeholder || 'Write something here...'} </span>
                              )} */}
                            </div>

                            <AddDialogueButton
                              index={index}
                              isInEditMode={mb.isInEditMode}
                              activeDialogue={activeDialogue}
                              onAddDialogue={handleAddDialogue}
                              onCoWriteClick={handleCoWriteClick}
                              onRemoveDialogue={handleRemoveDialogue}
                              // onGenerateWithAI={handleGenerateWithAI}
                              onSave={saveNewDialogHandler}
                              onClose={(index) => handleRemoveDialogue(index, true)}
                              dispatch={dispatch} // ✅ NEW
                              mainBody={mainBody} // ✅ NEW
                            />
                          </div>
                        </span>
                      )}
                    </div>
                  </section>
                );
              }

              return null;
            })}

            <ContentBox
              title={mainBody.filter((mb) => mb.label === 'closingScene')?.[0]?.heading}
              sceneScript={mainBody.filter((mb) => mb.label === 'closingScene')?.[0]?.text}
              showAddDialogue={false}
              onTextChange={onClosingSceneTextChange}
              // onTextChange={onEndingSceneTextChange}
              onTitleChange={onClosingSceneTitleChange} // Pass onTitleChange function to ContentBox
              isEditable={true} // Make the title editable
              //  onParaphrase={(text) => handleParaphrase(mainBody.length - 1, text, 'closing')}
            />

            <div className="action-buttons">
              <button className="download-button" onClick={handleDownload}>
                <Download size={18} />
                Download Script
              </button>
              <button className="copy-button" onClick={handleCopy}>
                <Copy size={18} />
                Copy to Clipboard
              </button>

              <div className="word-count">
                Total Words:{' '}
                {countWords(openingSceneScript?.initial_story) +
                  mainBody?.reduce((total, item) => total + countWords(item.text), 0) +
                  countWords(closingSceneScript || script.follow_up_story)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Write;
