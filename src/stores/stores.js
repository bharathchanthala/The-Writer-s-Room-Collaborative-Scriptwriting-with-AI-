import { configureStore, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

// Initial state for script object
const initialState = {
  script: {
    initial_story: '',
    characters: [],
    conversation: [],
    endingScene: '',
    setting: '',
    initialSceneHeading: '',

    // Initialize with an empty array as the first version
    mainBodyVersions: {}, // Use array instead of object for easier management
    currentMainBodyVersion: 0,
    totalVersions: 1, // Track total versions for redo functionality

    endingSceneHeading: '',
    endingSceneDescription: '',

    // New stuff
    Narratives: []
  }
};

// Create Redux slice for script management
const scriptSlice = createSlice({
  name: 'script',
  initialState,
  reducers: {
    updateScript: (state, action) => {
      state.script = { ...state.script, ...action.payload };
    },
    updateDialogScript: (state, action) => {
      state.script.conversation.push(action.payload);
    },
    // TODO: review this later - this is just for testing purpose, need to optimise this later
    updateDialogScriptSomething: (state, action) => {
      state.script.conversation = action.payload;
    },
    updateSceneScript: (state, action) => {
      state.script.scene = action.payload;
    },
    upateEndingScene: (state, action) => {
      state.script.endingScene = action.payload;
    },
    updateMainBody: (state, action) => {
      const currentVersion = state.script.currentMainBodyVersion;

      // Fix the path - use state.script.mainBodyVersions instead of state.script.script.mainBodyVersions
      // if (!Array.isArray(state.script.mainBodyVersions)) {
      //   // Initialize it as an array if it's not already
      //   state.script.mainBodyVersions = [];
      // }

      // Remove any future versions that would be lost when making a new change after undoing
      // state.script.mainBodyVersions = state.script.mainBodyVersions.slice(0, currentVersion + 1);

      // Add the new version
      state.script.mainBodyVersions[currentVersion + 1] = action.payload;
      // state.script.mainBodyVersions = cloneDeep(state.script.mainBodyVersions);

      // Update current version pointer
      state.script.currentMainBodyVersion = Object.keys(state.script.mainBodyVersions).length - 1;
      state.script.totalVersions = state.script.mainBodyVersions.length;
    },

    updateOpeningSceneHeading: (state, action) => {
      const currentVersion = state.script.currentMainBodyVersion;

      // Remove any future versions that would be lost when making a new change after undoing
      // state.script.mainBodyVersions = state.script.mainBodyVersions.slice(0, currentVersion + 1);

      const _mainBodyVersions = cloneDeep(state.script.mainBodyVersions);
      _mainBodyVersions[currentVersion].forEach(mb => {
        if (mb.label === 'openingScene') {
          mb.heading = action.payload
        }
      });
      console.log('_mainBodyVersions: ', _mainBodyVersions);

      // Add the new version
      state.script.mainBodyVersions[currentVersion + 1] = _mainBodyVersions[0];
      state.script.mainBodyVersions = cloneDeep(state.script.mainBodyVersions);

      // Update current version pointer
      state.script.currentMainBodyVersion = Object.keys(state.script.mainBodyVersions).length - 1;
      state.script.totalVersions = state.script.mainBodyVersions.length;
    },

    updateOpeningSceneText: (state, action) => {
      const currentVersion = state.script.currentMainBodyVersion;

      // Remove any future versions that would be lost when making a new change after undoing
      state.script.mainBodyVersions = state.script.mainBodyVersions.slice(0, currentVersion + 1);

      const _mainBodyVersions = cloneDeep(state.script.mainBodyVersions);
      _mainBodyVersions[currentVersion].forEach(mb => {
        if (mb.label === 'openingScene') {
          mb.text = action.payload
        }
      });
      console.log('_mainBodyVersions: ', _mainBodyVersions);

      // Add the new version
      state.script.mainBodyVersions.push(_mainBodyVersions);
      state.script.mainBodyVersions = cloneDeep(state.script.mainBodyVersions);

      // Update current version pointer
      state.script.currentMainBodyVersion = state.script.mainBodyVersions.length - 1;
      state.script.totalVersions = state.script.mainBodyVersions.length;
    },

    undoMainBody: (state) => {
      const currentVersion = state.script.currentMainBodyVersion;
      if (currentVersion > 0) {
        state.script.currentMainBodyVersion = currentVersion - 1;
        state.script.mainBody = state.script.mainBodyVersions[state.script.currentMainBodyVersion];
      }
    },

    redoMainBody: (state) => {
      const currentVersion = state.script.currentMainBodyVersion;
      if (currentVersion + 1 < Object.keys(state.script.mainBodyVersions).length) {
        state.script.currentMainBodyVersion = currentVersion + 1;
        state.script.mainBody = state.script.mainBodyVersions[state.script.currentMainBodyVersion];
      }
    },

    updateInitialStory: (state, action) => {
      state.script.initial_story = action.payload;
    },
    updateEndingScene: (state, action) => {
      state.script.endingSceneDescription = action.payload;
    },
    updateInitialSceneHeading: (state, action) => {
      state.script.initialSceneHeading = action.payload;
    },
    updateEndingSceneHeading: (state, action) => {
      state.script.endingSceneHeading = action.payload;
    }
  }
});

// Export actions
export const {
  updateScript,
  updateDialogScript,
  upateEndingScene,
  updateSceneScript,
  updateDialogScriptSomething,
  updateMainBody,
  updateInitialStory,
  updateEndingScene,
  undoMainBody,
  redoMainBody,
  updateInitialSceneHeading,
  updateEndingSceneHeading,
  updateOpeningSceneHeading,
  updateOpeningSceneText
} = scriptSlice.actions;

// Create Redux store
const store = configureStore({
  reducer: {
    script: scriptSlice.reducer
  }
});

export default store;
