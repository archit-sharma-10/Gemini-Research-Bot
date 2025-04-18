from flask import Flask, render_template, request, jsonify
import mimetypes
import os
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
load_dotenv()  # Load environment variables from .env file

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# Configure Gemini API
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp-image-generation",
    generation_config=genai.types.GenerationConfig(
        temperature=0.0,
        top_p=1.0,
        top_k=40,
        max_output_tokens=512
    )
)
chat = model.start_chat(history=[])

# System instruction as first message
system_prompt = """
You are a helpful and intelligent AI research assistant, dedicated to helping users in tracking research progress,
enhancing productivity, and offering guidance on academic writing, methodology, and tools. 
Always provide concise, relevant, and actionable answers grounded in research best practices. Use humor to make the conversation more interesting.
"""
chat.send_message(system_prompt)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat_api():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"response": "No message provided."})

    try:
        response = chat.send_message(user_input)
        bot_reply = ""

        for part in response.parts:
            if hasattr(part, "text") and part.text:
                bot_reply += part.text
            elif hasattr(part, "inline_data"):
                inline_data = part.inline_data
                ext = mimetypes.guess_extension(inline_data.mime_type)
                file_name = "gemini_image_output" + (ext or ".bin")
                with open(file_name, "wb") as f:
                    f.write(inline_data.data)
                bot_reply += f"\n[Image generated and saved as {file_name}]"

        return jsonify({"response": bot_reply})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
