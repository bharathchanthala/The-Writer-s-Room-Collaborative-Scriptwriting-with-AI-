import { configureStore, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

const initialState = {
  initial_story: '',
  characters: [],
  conversation: [],
  endingScene: '',
  setting: '',
  initialSceneHeading: '',
  mainBody: [],
  endingSceneHeading: '',
  endingSceneDescription: '',
  Narratives: [],

  // Undo / Redo
  versions: [],
  currentVersion: 0,
};


// Create a clean screenplay snapshot.
// History itself is NOT included inside the snapshot.
const createSnapshot = (state) => ({
  initial_story: state.initial_story,
  characters: cloneDeep(state.characters),
  conversation: cloneDeep(state.conversation),
  endingScene: state.endingScene,
  setting: state.setting,
  initialSceneHeading: state.initialSceneHeading,
  mainBody: cloneDeep(state.mainBody),
  endingSceneHeading: state.endingSceneHeading,
  endingSceneDescription: state.endingSceneDescription,
  Narratives: cloneDeep(state.Narratives),
});


// Save a new version
const saveSnapshot = (state) => {
  const nextVersion = state.currentVersion + 1;

  // Remove redo history if user edits after undo
  state.versions = state.versions.slice(0, nextVersion);

  state.versions.push(createSnapshot(state));

  state.currentVersion = nextVersion;
};


// Restore a screenplay snapshot
const applySnapshot = (state, snapshot) => {
  Object.assign(state, cloneDeep(snapshot));
};


const scriptSlice = createSlice({
  name: 'script',

  initialState,

  reducers: {

    // Initial screenplay from Settings / Draft
    updateScript: (state, action) => {
      Object.assign(state, action.payload);

      // Start history with the initial screenplay
      state.versions = [createSnapshot(state)];
      state.currentVersion = 0;
    },


    // Main body changed
    updateMainBody: (state, action) => {
      state.mainBody = cloneDeep(action.payload);

      saveSnapshot(state);
    },


    // Opening scene heading
    updateInitialSceneHeading: (state, action) => {
      state.initialSceneHeading = action.payload;

      saveSnapshot(state);
    },


    // Opening scene text
    updateInitialStory: (state, action) => {
      state.initial_story = action.payload;

      saveSnapshot(state);
    },


    // Closing scene heading
    updateEndingSceneHeading: (state, action) => {
      state.endingSceneHeading = action.payload;

      saveSnapshot(state);
    },


    // Closing scene text
    updateEndingScene: (state, action) => {
      state.endingSceneDescription = action.payload;

      saveSnapshot(state);
    },


    // Add dialogue / conversation
    updateDialogScript: (state, action) => {
      state.conversation.push(action.payload);

      saveSnapshot(state);
    },


    // Replace conversation
    updateDialogScriptSomething: (state, action) => {
      state.conversation = cloneDeep(action.payload);

      saveSnapshot(state);
    },


    // Scene update
    updateSceneScript: (state, action) => {
      state.scene = cloneDeep(action.payload);

      saveSnapshot(state);
    },


    // Ending scene legacy action
    upateEndingScene: (state, action) => {
      state.endingScene = action.payload;

      saveSnapshot(state);
    },


    // Opening scene heading legacy action
    updateOpeningSceneHeading: (state, action) => {
      state.initialSceneHeading = action.payload;

      saveSnapshot(state);
    },


    // Opening scene text legacy action
    updateOpeningSceneText: (state, action) => {
      state.initial_story = action.payload;

      saveSnapshot(state);
    },


    // Undo
    undoMainBody: (state) => {
      if (state.currentVersion <= 0) {
        return;
      }

      state.currentVersion -= 1;

      const previousVersion =
        state.versions[state.currentVersion];

      applySnapshot(state, previousVersion);
    },


    // Redo
    redoMainBody: (state) => {
      if (
        state.currentVersion >=
        state.versions.length - 1
      ) {
        return;
      }

      state.currentVersion += 1;

      const nextVersion =
        state.versions[state.currentVersion];

      applySnapshot(state, nextVersion);
    },
  },
});


export const {
  updateScript,
  updateMainBody,
  updateDialogScript,
  updateDialogScriptSomething,
  updateSceneScript,
  upateEndingScene,
  updateOpeningSceneHeading,
  updateOpeningSceneText,
  updateInitialStory,
  updateInitialSceneHeading,
  updateEndingScene,
  updateEndingSceneHeading,
  undoMainBody,
  redoMainBody,
} = scriptSlice.actions;


const store = configureStore({
  reducer: {
    script: scriptSlice.reducer,
  },
});


export default store;