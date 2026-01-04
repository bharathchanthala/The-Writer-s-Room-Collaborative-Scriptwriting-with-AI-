from flask import Flask, request, Response, stream_with_context, jsonify
from flask_cors import CORS, cross_origin
import requests
import json
import logging

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

default_model = "default:latest"

# =============================================================================
# Endpoint 1: Generate Initial Scene
# =============================================================================
@app.route('/initial_scene', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_initial_scene():
    if request.method == 'OPTIONS':
        # Handle preflight CORS request
        return Response(status=200)
    
    try:
        data = request.get_json(force=True)
    except Exception as e:
        logger.error(f"Error reading JSON: {e}")
        return Response("Invalid JSON", status=400)
    
    # Use default values if some inputs are missing.
    setting = data.get("setting", "a quiet town")
    characters = data.get("characters", [
        {"name": "Alex", "trait": "a brave protagonist."},
        {"name": "Jordan", "trait": "a mysterious figure."}
    ])
    
    # Create a comma-separated list of character names.
    char_names = ", ".join([char.get("name", "Unknown") for char in characters])
    
    # Construct a prompt that introduces the setting and characters.
    prompt = (
        f"Write a cinematic movie scene set in {setting} featuring the characters: {char_names}. "
        "Introduce the setting and the characters with vivid, engaging details and establish a tone "
        "that promises a dramatic, intriguing movie ahead."
    )
    
    payload = {"model": default_model, "prompt": prompt, "stream": True}
    headers = {'Content-Type': 'application/json'}
    
    logger.debug(f"Initial scene prompt: {prompt}")

    @stream_with_context
    def generate():
        try:
            response = requests.post(
                "https://llm.srv.webis.de/api/generate",
                data=json.dumps(payload),
                headers=headers,
                stream=True
            )
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            part = json.loads(line.decode('utf-8')).get('response', '')
                            yield f"data: {json.dumps({'type': 'initial_scene_chunk', 'data': part})}\n\n"
                        except Exception as e:
                            logger.error(f"Error parsing initial scene line: {e}")
                            continue
            else:
                fallback = ("Fallback initial scene: In a quiet town, as the sun rises, two intriguing figures "
                            "meet, marking the beginning of an epic tale.")
                logger.debug(f"Initial scene API returned {response.status_code}. Using fallback.")
                yield f"data: {json.dumps({'type': 'initial_scene_chunk', 'data': fallback})}\n\n"
        except Exception as e:
            logger.error(f"Error in /initial_scene endpoint: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': 'An error occurred while generating the initial scene.'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

# =============================================================================
# Endpoint 2: Generate a New Scene
# =============================================================================
@app.route('/scene', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_scene():
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    try:
        data = request.get_json(force=True)
    except Exception as e:
        logger.error(f"Error reading JSON: {e}")
        return Response("Invalid JSON", status=400)
    
    current_script = data.get("current_script", "")
    scene_description = data.get("scene_description", "Continue the story in a cinematic way.")
    
    if not current_script:
        error_msg = "Missing required field: current_script"
        logger.error(error_msg)
        return Response(f"data: {json.dumps({'type': 'error', 'data': '{error_msg}'})}\n\n", mimetype='text/event-stream')
    
    prompt = (
        f"Based on the following movie script:\n\n{current_script}\n\n"
        f"Generate a new scene. {scene_description}\n\n"
        "Write a cinematic scene that advances the story."
    )
    
    payload = {"model": default_model, "prompt": prompt, "stream": True}
    headers = {'Content-Type': 'application/json'}
    
    logger.debug(f"Scene prompt: {prompt}")

    @stream_with_context
    def generate():
        try:
            response = requests.post(
                "https://llm.srv.webis.de/api/generate",
                data=json.dumps(payload),
                headers=headers,
                stream=True
            )
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            part = json.loads(line.decode('utf-8')).get('response', '')
                            yield f"data: {json.dumps({'type': 'scene_chunk', 'data': part})}\n\n"
                        except Exception as e:
                            logger.error(f"Error parsing scene line: {e}")
                            continue
            else:
                fallback = "Fallback scene: The narrative takes an unexpected turn, setting the stage for a dramatic sequence."
                logger.debug(f"Scene generation API returned {response.status_code}. Using fallback.")
                yield f"data: {json.dumps({'type': 'scene_chunk', 'data': fallback})}\n\n"
        except Exception as e:
            logger.error(f"Error in /scene endpoint: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': 'An error occurred while generating the scene.'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

# =============================================================================
# Endpoint 3: Generate a Dialogue
# =============================================================================
@app.route('/dialogue', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_dialogue():
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    try:
        data = request.get_json(force=True)
    except Exception as e:
        logger.error(f"Error reading JSON: {e}")
        return Response("Invalid JSON", status=400)
    
    speaker = data.get("speaker", "Unknown")
    trait = data.get("trait", f"{speaker} is an interesting character.")
    current_scene = data.get("current_scene", "")
    dialogue_context = data.get("dialogue_context", [])
    
    # Construct the system message for the character.
    system_message = f"Your name is {speaker}. {trait} "
    if current_scene:
        system_message += f"The current scene is: {current_scene}. "
    system_message += "Respond with a short, cinematic dialogue line appropriate to the scene keep it below 50 characters."
    
    # Build the messages list for the chat API.
    messages = [{"role": "system", "content": system_message}]
    # If a dialogue context is provided, include it.
    if dialogue_context:
        # Expecting dialogue_context to be a list of previous messages.
        messages.extend(dialogue_context)
    messages.append({"role": "user", "content": "Your turn to speak."})
    
    payload = {"model": default_model, "messages": messages, "stream": True}
    headers = {'Content-Type': 'application/json'}
    
    logger.debug(f"Dialogue messages for {speaker}: {messages}")

    @stream_with_context
    def generate():
        try:
            response = requests.post(
                "https://llm.srv.webis.de/api/chat",
                data=json.dumps(payload),
                headers=headers,
                stream=True
            )
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            token = json.loads(line.decode('utf-8')).get('message', {}).get('content', '')
                            yield f"data: {json.dumps({'type': 'dialogue_chunk', 'speaker': speaker, 'data': token})}\n\n"
                        except Exception as e:
                            logger.error(f"Error parsing dialogue line: {e}")
                            continue
            else:
                fallback = f"Fallback dialogue: {speaker} remains silent for a moment."
                logger.debug(f"Dialogue API returned {response.status_code}. Using fallback.")
                yield f"data: {json.dumps({'type': 'dialogue_chunk', 'speaker': speaker, 'data': fallback})}\n\n"
        except Exception as e:
            logger.error(f"Error in /dialogue endpoint: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': 'An error occurred while generating dialogue.'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

# =============================================================================
# Endpoint 4: Generate the Ending Scene
# =============================================================================
@app.route('/ending_scene', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_ending_scene():
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    try:
        data = request.get_json(force=True)
    except Exception as e:
        logger.error(f"Error reading JSON: {e}")
        return Response("Invalid JSON", status=400)
    
    current_script = data.get("current_script", "")
    ending_description = data.get("ending_description", "The movie reaches a dramatic and satisfying conclusion.")
    
    if not current_script:
        error_msg = "Missing required field: current_script"
        logger.error(error_msg)
        return Response(f"data: {json.dumps({'type': 'error', 'data': '{error_msg}'})}\n\n", mimetype='text/event-stream')
    
    prompt = (
        f"Based on the following movie script:\n\n{current_script}\n\n"
        f"Generate the final ending scene. {ending_description}\n\n"
        "Tie up loose ends and write an ending scene that leaves a lasting cinematic impact."
    )
    
    payload = {"model": default_model, "prompt": prompt, "stream": True}
    headers = {'Content-Type': 'application/json'}
    
    logger.debug(f"Ending scene prompt: {prompt}")

    @stream_with_context
    def generate():
        try:
            response = requests.post(
                "https://llm.srv.webis.de/api/generate",
                data=json.dumps(payload),
                headers=headers,
                stream=True
            )
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            part = json.loads(line.decode('utf-8')).get('response', '')
                            yield f"data: {json.dumps({'type': 'ending_scene_chunk', 'data': part})}\n\n"
                        except Exception as e:
                            logger.error(f"Error parsing ending scene line: {e}")
                            continue
            else:
                fallback = "Fallback ending: The movie concludes with a powerful, unforgettable finale."
                logger.debug(f"Ending scene API returned {response.status_code}. Using fallback.")
                yield f"data: {json.dumps({'type': 'ending_scene_chunk', 'data': fallback})}\n\n"
        except Exception as e:
            logger.error(f"Error in /ending_scene endpoint: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': 'An error occurred while generating the ending scene.'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

# =============================================================================
# Optional: Home Endpoint for Testing
# =============================================================================
@app.route('/', methods=['GET'])
def home():
    return "Movie Script Generation API is running."

# =============================================================================
# Run the Flask Server
# =============================================================================
if __name__ == '__main__':
    logger.info("Starting the Movie Script Generation API...")
    app.run(debug=True, threaded=True)