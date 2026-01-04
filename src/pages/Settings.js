// Settings.js
import cloneDeep from 'lodash/cloneDeep';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/titlelogo.png';
import Flash from '../components/Flash';
import { updateScript } from '../stores/stores';
import './Settings.css';

const Setting = () => {
  const [characters, setCharacters] = useState([
    { name: '', trait: '' },
    { name: '', trait: '' }
  ]);

  const dispatch = useDispatch();

  const [maxTurns, setMaxTurns] = useState(5);
  const [story, setStory] = useState({ setting: '' });
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const handleCharacterChange = (index, field, value) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index][field === 'details' ? 'trait' : field] = value;
    setCharacters(updatedCharacters);
  };

  const handleStorySetting = (field, value) => {
    setStory((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };

  const removeCharacterHandler = () => {
    if (characters.length > 2) {
      setCharacters((prevCharacters) => prevCharacters.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show flash screen
    const apiEndpoint = 'http://gammaweb06.medien.uni-weimar.de:8000/generate_complete_story';
    //  TODO: comment by B
    // const eventSource = new EventSource(apiEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   // Accept: 'text/event-stream'
    //   },
    //   body: JSON.stringify({
    //     setting: story.setting,
    //     characters: characters.map((char) => ({
    //       name: char.name,
    //       trait: char.trait
    //     }))
    //   })
    // });

    // eventSource.onmessage = (event) => {
    //   console.log('event: ', event);
    // };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          setting: `${story.setting}`,
          characters: characters.map((char) => ({
            name: char.name,
            trait: char.trait
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const {
        initial_scene_heading,
        initial_scene_description,
        main_body,
        ending_scene_heading,
        ending_scene_description
      } = data;

      const appVersions = (mainBody, openingSceneHeading, openingSceneStory, closingSceneHeading, closingSceneStory) => {
        const _mainBody = cloneDeep(mainBody);

        _mainBody.push({
          label: 'openingScene',
          heading: openingSceneHeading,
          text: openingSceneStory
        })

        _mainBody.push({
          label: 'closingScene',
          heading: closingSceneHeading,
          text: closingSceneStory
        })
        return _mainBody;
      }

      dispatch(
        updateScript({
          initialSceneHeading: initial_scene_heading,
          initial_story: initial_scene_description,
          mainBody: main_body,
          mainBodyVersions: {
            0: appVersions(main_body, initial_scene_heading, initial_scene_description, ending_scene_heading, ending_scene_description)
          },
          endingSceneHeading: ending_scene_heading,
          endingSceneDescription: ending_scene_description,
          characters: characters.map((char) => ({
            name: char.name,
            trait: char.trait
          })),
          setting: story.setting
        })
      );

      navigate('/write');
    } catch (error) {
      console.error('Error fetching story:', error);
      alert('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCharacterHandler = () => {
    const charactersCopy = cloneDeep(characters);
    charactersCopy.push({});
    setCharacters(charactersCopy);
  };

  return (
    <div className="setting-page">
      {loading && <Flash />} {/* Show flash screen when loading */}
      <div className="header">
        <button className="hamburger">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
        <div className="logo">
          <Link to="/ ">
            <img src={logo} alt="The Writer's Room Logo" />
          </Link>
        </div>
      </div>
      <div className="content">
        <h1>Character Details</h1>
        <form id="character-form" onSubmit={handleSubmit}>
          {characters.map((character, index) => (
            <div key={index} className="character-input-group">
              <label htmlFor={`character-name-${index}`}> Character {index + 1}: &nbsp; &nbsp;</label>
              <input
                className="input-text"
                type="text"
                id={`character-name-${index}`}
                placeholder="Enter character name"
                value={character.name}
                onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
              />
              <label htmlFor={`character-details-${index}`}>
                {' '}
                &nbsp;&nbsp;&nbsp;Character {index + 1} Details : &nbsp;{' '}
              </label>
              <textarea
                className="input-text"
                id={`character-details-${index}`}
                placeholder="Enter character details"
                rows="2"
                style={{ width: '300px', resize: 'none', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
                value={character.trait}
                onChange={(e) => handleCharacterChange(index, 'details', e.target.value)}
              ></textarea>
            </div>
          ))}
          <div className="form-buttons">
            <button type="button" className="add-button" onClick={addCharacterHandler}>
              Add Character
            </button>
            <button
              type="button"
              className="remove-button"
              onClick={removeCharacterHandler}
              disabled={characters.length <= 2}
            >
              Remove Character
            </button>
          </div>
          <div className="form-group">
            <label className="setting" htmlFor="story-setting">
              Story Setting:{' '}
            </label>
            <input
              type="text"
              placeholder="Enter story setting"
              id="story-setting"
              value={story.setting}
              onChange={(e) => handleStorySetting('setting', e.target.value)}
            />
          </div>
          <div className="form-buttons">
            <button type="button" className="back-button" onClick={() => navigate('/')}>
              Back
            </button>
            <button type="submit" id="write-button" className="submit-button">
              Generate Your Script
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setting;
