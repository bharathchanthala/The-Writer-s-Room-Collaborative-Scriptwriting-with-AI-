export const generateScene = async(currentScript) => {
    const endpointUrl = "http://127.0.0.1:5000/scene";

    const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            current_script: currentScript,
            scene_description: 'Introduce a mysterious event that changes the course of the story.'
          })
    });

  return response;
}