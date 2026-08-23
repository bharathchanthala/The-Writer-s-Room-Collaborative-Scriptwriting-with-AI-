import { configureStore, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

// Initial state for script object
const initialState = {
  
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
  
};

// Create Redux slice for script management
const scriptSlice = createSlice({
  name: 'script',
  initialState,
  reducers: {
    updateScript: (state, action) => {
     Object.assign ( state,action.payload);              //Object.assign(target, source);  as: Take the properties from source and put them inside target.
    },
    updateDialogScript: (state, action) => {
      state.conversation.push(action.payload);
    },
    // TODO: review this later - this is just for testing purpose, need to optimise this later
    updateDialogScriptSomething: (state, action) => {
      state.conversation = action.payload;
    },
    updateSceneScript: (state, action) => {
      state.scene = action.payload;
    },
    upateEndingScene: (state, action) => {
      state.endingScene = action.payload;
    },
    updateMainBody: (state, action) => {
      const currentVersion = state.currentMainBodyVersion;

      // Fix the path - use state.mainBodyVersions instead of state.mainBodyVersions
      // if (!Array.isArray(state.mainBodyVersions)) {
      //   // Initialize it as an array if it's not already
      //   state.mainBodyVersions = [];
      // }

      // Remove any future versions that would be lost when making a new change after undoing
      // state.mainBodyVersions = state.mainBodyVersions.slice(0, currentVersion + 1);

      // Add the new version
      state.mainBodyVersions[currentVersion + 1] = action.payload;
      // state.mainBodyVersions = cloneDeep(state.mainBodyVersions);

      // Update current version pointer
      state.currentMainBodyVersion = Object.keys(state.mainBodyVersions).length - 1;
      state.totalVersions = state.mainBodyVersions.length;
    },

    updateOpeningSceneHeading: (state, action) => {
      const currentVersion = state.currentMainBodyVersion;

      // Remove any future versions that would be lost when making a new change after undoing
      // state.mainBodyVersions = state.mainBodyVersions.slice(0, currentVersion + 1);

      const _mainBodyVersions = cloneDeep(state.mainBodyVersions);
      _mainBodyVersions[currentVersion].forEach(mb => {
        if (mb.label === 'openingScene') {
          mb.heading = action.payload
        }
      });
      console.log('_mainBodyVersions: ', _mainBodyVersions);

      // Add the new version
      state.mainBodyVersions[currentVersion + 1] = _mainBodyVersions[0];
      state.mainBodyVersions = cloneDeep(state.mainBodyVersions);

      // Update current version pointer
      state.currentMainBodyVersion = Object.keys(state.mainBodyVersions).length - 1;
      state.totalVersions = state.mainBodyVersions.length;
    },

    updateOpeningSceneText: (state, action) => {
      const currentVersion = state.currentMainBodyVersion;

      // Remove any future versions that would be lost when making a new change after undoing
      state.mainBodyVersions = state.mainBodyVersions.slice(0, currentVersion + 1);

      const _mainBodyVersions = cloneDeep(state.mainBodyVersions);
      _mainBodyVersions[currentVersion].forEach(mb => {
        if (mb.label === 'openingScene') {
          mb.text = action.payload
        }
      });
      console.log('_mainBodyVersions: ', _mainBodyVersions);

      // Add the new version
      state.mainBodyVersions.push(_mainBodyVersions);
      state.mainBodyVersions = cloneDeep(state.mainBodyVersions);

      // Update current version pointer
      state.currentMainBodyVersion = state.mainBodyVersions.length - 1;
      state.totalVersions = state.mainBodyVersions.length;
    },

    undoMainBody: (state) => {
      const currentVersion = state.currentMainBodyVersion;
      if (currentVersion > 0) {
        state.currentMainBodyVersion = currentVersion - 1;
        state.mainBody = state.mainBodyVersions[state.currentMainBodyVersion];
      }
    },

    redoMainBody: (state) => {
      const currentVersion = state.currentMainBodyVersion;
      if (currentVersion + 1 < Object.keys(state.mainBodyVersions).length) {
        state.currentMainBodyVersion = currentVersion + 1;
        state.mainBody = state.mainBodyVersions[state.currentMainBodyVersion];
      }
    },

    updateInitialStory: (state, action) => {
      state.initial_story = action.payload;
    },
    updateEndingScene: (state, action) => {
      state.endingSceneDescription = action.payload;
    },
    updateInitialSceneHeading: (state, action) => {
      state.initialSceneHeading = action.payload;
    },
    updateEndingSceneHeading: (state, action) => {
      state.endingSceneHeading = action.payload;
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
