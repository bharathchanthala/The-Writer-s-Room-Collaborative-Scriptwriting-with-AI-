import axios from 'axios';

const STORY_API_URL =
  'http://gammaweb06.medien.uni-weimar.de:8000/generate_complete_story';

export const generateStory = async (setting) => {
  const response = await axios.post(STORY_API_URL, {
    setting,
  });
  console.log (response.data);

  return response.data;
};