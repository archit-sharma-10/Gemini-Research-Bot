from flask import Flask, render_template, request, jsonify, redirect, session, url_for, flash
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import check_password_hash, generate_password_hash
import mimetypes
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
load_dotenv()  # Load environment variables from .env file
app.secret_key = 'supersecret'
csrf = CSRFProtect(app)

USERS_FILE = 'users.json'
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    else:
        return {'admin': generate_password_hash('password123')}

def save_users(users_dict):
    with open(USERS_FILE, 'w') as f:
        json.dump(users_dict, f)

users = load_users()
print("Loaded users: ", list(users.keys()))

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# Configure Gemini API
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp-image-generation",
    generation_config=genai.types.GenerationConfig(
        temperature=0.3,
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
Always provide concise, relevant, and actionable answers grounded in research best practices.
"""
chat.send_message(system_prompt)

@app.route("/")
def index():
    user = session.get('user')
    print("Current user in session:", user)
    if not user:
        return render_template("index.html", user=session.get('user'))
    return render_template("index.html", user=user)

@app.route('/login', methods=['POST']) 
def login():
    username = request.form['username']
    password = request.form['password']

    users = load_users()
    user_hash = users.get(username)

    if user_hash and check_password_hash(user_hash, password):
        session['user'] = username
        print("Logged in as:", session['user'])
        return redirect(url_for('index'))
    else:
        flash("Invalid credentials")
        return redirect(url_for("index"))

@app.route("/register", methods=["POST"])
def register():
    users = load_users()
    username = request.form['username']
    password = request.form['password']

    if username in users:
        flash("Username already exists!")
        return redirect(url_for("index"))
    users[username] = generate_password_hash(password)
    save_users(users)

    flash("Registered successfully! Please login.")
    return redirect(url_for("index"))

@csrf.exempt
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

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))
if __name__ == "__main__":
    app.run(debug=True)
