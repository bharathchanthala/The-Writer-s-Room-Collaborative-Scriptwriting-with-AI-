import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import cloneDeep from "lodash/cloneDeep";

import { updateScript } from "../stores/stores";

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [characters, setCharacters] = useState([
    {
      name: "",
      trait: "",
    },
    {
      name: "",
      trait: "",
    },
  ]);

  const [story, setStory] = useState({
    setting: "",
  });

  const [loading, setLoading] = useState(false);

  const addCharacterHandler = () => {
    setCharacters((prev) => [
      ...prev,
      {
        name: "",
        trait: "",
      },
    ]);
  };

  const removeCharacterHandler = (index) => {
    setCharacters((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const characterChangeHandler = (index, field, value) => {
    setCharacters((prev) => {
      const updatedCharacters = cloneDeep(prev);

      updatedCharacters[index][field] = value;

      return updatedCharacters;
    });
  };

  const settingChangeHandler = (event) => {
    setStory((prev) => ({
      ...prev,
      setting: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://gammaweb06.medien.uni-weimar.de:8000/generate_complete_story",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            setting: story.setting,
            characters: characters.map((char) => ({
              name: char.name,
              trait: char.trait,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      const {
        initial_scene_heading,
        initial_scene_description,
        main_body,
        ending_scene_heading,
        ending_scene_description,
      } = data;

      dispatch(
        updateScript({
          initialSceneHeading: initial_scene_heading || "",
          initial_story: initial_scene_description || "",

          mainBody: Array.isArray(main_body)
            ? main_body
            : [],

          endingSceneHeading: ending_scene_heading || "",
          endingSceneDescription:
            ending_scene_description || "",

          characters: characters.map((char) => ({
            name: char.name,
            trait: char.trait,
          })),

          setting: story.setting,

          conversation: [],
          endingScene: "",
          Narratives: [],
        })
      );

      navigate("/write");
    } catch (error) {
      console.error("Error generating screenplay:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">

        <h1>Screenplay Settings</h1>

        <form onSubmit={handleSubmit}>

          {/* Setting */}
          <div className="setting-section">
            <label htmlFor="setting">
              Story Setting
            </label>

            <textarea
              id="setting"
              value={story.setting}
              onChange={settingChangeHandler}
              placeholder="Describe the setting of your story..."
              rows={5}
            />
          </div>


          {/* Characters */}
          <div className="characters-section">

            <div className="section-header">
              <h2>Characters</h2>

              <button
                type="button"
                onClick={addCharacterHandler}
              >
                Add Character
              </button>
            </div>


            {characters.map((character, index) => (
              <div
                className="character-row"
                key={index}
              >

                <div className="character-field">

                  <label>
                    Character Name
                  </label>

                  <input
                    type="text"
                    value={character.name}
                    onChange={(event) =>
                      characterChangeHandler(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Character name"
                  />

                </div>


                <div className="character-field">

                  <label>
                    Character Trait
                  </label>

                  <input
                    type="text"
                    value={character.trait}
                    onChange={(event) =>
                      characterChangeHandler(
                        index,
                        "trait",
                        event.target.value
                      )
                    }
                    placeholder="Character trait"
                  />

                </div>


                {characters.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeCharacterHandler(index)
                    }
                  >
                    Remove
                  </button>
                )}

              </div>
            ))}

          </div>


          {/* Submit */}
          <div className="settings-actions">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "Generate Screenplay"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default Settings;