export const generateClosingScene = async(currentScript) => {
    const endpointUrl = "http://127.0.0.1:5000/ending_scene";

    const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            current_script: currentScript,
            ending_description: 'The story reaches an emotional and thought-provoking conclusion.'
          })
    });

  return response;
}