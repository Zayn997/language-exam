from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "https://main--fluentflowenglish.netlify.app"}})


# Set your OpenAI API key here
openai.api_key = os.getenv('OPENAI_API_KEY')
print("OpenAI API Key:", os.getenv('OPENAI_API_KEY'))

@app.route('/')
def index():
    return "Welcome to the AI exam"

@app.route('/generate-question', methods=['POST'])
def generate_question():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400
        
        completion = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        response_text = completion.choices[0].message.content
        print ({"content": response_text})



        return jsonify({"content": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
