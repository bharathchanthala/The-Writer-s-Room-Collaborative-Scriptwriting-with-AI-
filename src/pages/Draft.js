import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Draft.css';
import logo from '../assets/titlelogo.png';
import { Link } from 'react-router-dom';
import { updateScript } from '../stores/stores';
import { LoadingButton } from '@mui/lab';
import Flash from '../components/Flash';

const Draft = () => {
  const [draftText, setDraftText] = useState('');
  const [fileName, setFileName] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const allowedFileTypes = ['text/plain', 'application/json'];
  const dispatch = useDispatch();

  useEffect(() => {
    const draftContainer = document.querySelector('.draft-container');
    if (fileUploaded) {
      draftContainer.style.marginTop = '20px';
      draftContainer.style.height = '60vh';
    } else {
      draftContainer.style.marginTop = '250px';
      draftContainer.style.height = '200px';
    }
  }, [fileUploaded]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDraftText(e.target.result);
        setFileName(file.name);
        setFileUploaded(true);
      };
      reader.readAsText(file);
    } else {
      alert('Only .txt and .json files are allowed.');
    }
  };

  const handleFileRemove = () => {
    setDraftText('');
    setFileName(null);
    setFileUploaded(false);
    document.getElementById('file-upload').value = '';
  };

  const getCharacters = (mainBody) => {
    const characters = mainBody.filter(mb => mb.label === 'Character_Name');

    const uniqueCharacters = characters.filter((item, index, self) => 
      self.findIndex(obj => obj.text === item.text) === index
    ).map(char => ({
      name: char.text
    }));

    console.log('uniqueCharacters: ', uniqueCharacters);

    return uniqueCharacters;
  }

  const handleContinue = async () => {
    if (!draftText.trim()) {
      alert('Please enter or import a draft.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://gammaweb06.medien.uni-weimar.de:8000/generate_complete_story', {
        setting: draftText
      });

      console.log('Response from backend:', response.data);

      const data = await response.data;

      const {
        initial_scene_heading,
        initial_scene_description,
        main_body,
        ending_scene_heading,
        ending_scene_description
      } = data;

      dispatch(
        updateScript({
          initialSceneHeading: initial_scene_heading,
          initial_story: initial_scene_description,
          mainBody: main_body,
          mainBodyVersions: {
            0: main_body
          },
          characters: getCharacters(main_body),
          endingSceneHeading: ending_scene_heading,
          endingSceneDescription: ending_scene_description,
          setting: draftText
        })
      );

      setLoading(false);

      // navigate('/write', { state: { dialogues: response.data } });
      navigate('/write');
    } catch (error) {
      console.error('Error sending draft to backend:', error);
      alert('Failed to process draft. Please try again.');
    }
  };

  return (
    <div className="draft-page">
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
      <div id="primary-nav" className="primary-nav">
        <button
          className="closebtn"
          onClick={() => {
            const nav = document.getElementById('primary-nav');
            nav.style.width = nav.style.width === '250px' ? '0' : '250px';
          }}
          aria-label="Close navigation"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          ×
        </button>
        <ul className="sidebar">
          <li>
            <Link to="/welcome">New</Link>
          </li>
          {/* <li>
            <button className="link-button" onClick={handleRecentClick}>
              Recent
            </button>
          </li> */}
        </ul>
      </div>
      <div className="content">
        <h1 className="welcome-title">Welcome to the Writer's Room!</h1>
        <h5 className="description">Here we can brainstorm script writing, from idea to screenplay!</h5>

        <div className="draft-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <textarea
            className="draft-box"
            id="draft-box"
            placeholder="Enter your idea here..."
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            style={{ flexGrow: 1, width: '100%', resize: 'none', whiteSpace: 'pre-wrap' }}
          ></textarea>

          <div className="button-container">
            <button type="button" className="button-back" onClick={() => navigate('/')}>
              Back
            </button>

            <label htmlFor="file-upload" className="custom-file-upload">
              Import file
              <input id="file-upload" type="file" accept=".txt,.json" onChange={handleFileUpload} />
            </label>
            {fileName && (
              <div className="file-info">
                <span>{fileName}</span>
                <button className="remove-btn" onClick={handleFileRemove}>
                  x
                </button>
              </div>
            )}

            <LoadingButton>
              <button className="continue-btn" onClick={handleContinue}>
                Continue
              </button>
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Draft;
