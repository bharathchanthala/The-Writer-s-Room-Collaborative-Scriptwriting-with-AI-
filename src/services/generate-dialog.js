export const generateDialog = async (
  speaker,
  trait,
  currentScene,
  dialogueContext
) => {
  const endpointUrl = "http://127.0.0.1:5000/dialogue";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      speaker,
      trait,
      current_scene: currentScene,
      dialog_context: dialogueContext,
    }),
  });

  return response;
};
