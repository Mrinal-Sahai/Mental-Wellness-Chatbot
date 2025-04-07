import joblib
import pandas as pd
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Details
API_KEY = "akash chat api key"
BASE_URL = "https://chatapi.akash.network/api/v1/chat/completions"

# System prompt to guide the model behavior for mental health support
MENTAL_HEALTH_SYSTEM_PROMPT = """
You are a supportive mental wellness assistant. Your role is to:
1. Detect signs of stress, anxiety, or emotional distress in user messages
2. Respond with empathy and understanding
3. Gave short response and try to maintain coversational impact
4. Offer practical coping strategies and relaxation techniques
5. Suggest professional help when appropriate
6. Never diagnose or replace professional mental health services
7. Maintain a calm, supportive tone
8.If there is a medicine name gave the usage and side-effect for it
9.Gave reult in plain text do not use bold and italic

For mild to moderate distress:
- Suggest deep breathing exercises, mindfulness techniques, or grounding exercises
- Offer encouragement and validation

For severe distress:
- Emphasize the importance of professional help


Always prioritize user safety and wellbeing.
"""

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400
    
    # Get conversation history if available
    conversation_history = request.json.get("history", [])
    
    # Prepare messages for the API
    messages = [
        {"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT}
    ]
    
    # Add conversation history
    for msg in conversation_history:
        messages.append(msg)
    
    # Add the current user message
    messages.append({"role": "user", "content": user_message})
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "Meta-Llama-3-1-8B-Instruct-FP8",
        "messages": messages,
        "temperature": 0.7,  # Add some variability but keep responses reliable
        "max_tokens": 500    # Allow for detailed responses when needed
    }
    
    try:
        response = requests.post(BASE_URL, json=data, headers=headers, timeout=15)
        if response.status_code == 200:
            api_response = response.json()
            bot_message = api_response["choices"][0]["message"]["content"]
            
            # Check if response contains crisis indicators requiring additional resources
            crisis_keywords = ["harm", "suicide", "kill", "die", "end my life", "no point"]
            needs_resources = any(keyword in user_message.lower() for keyword in crisis_keywords)
            
            response_data = {
                "message": bot_message,
                "tokens_used": api_response["usage"]["total_tokens"]
            }
            
            # Add crisis resources if needed
            if needs_resources:
                response_data["crisis_resources"] = {
                    "text_line": "Text HOME to 741741",
                    "suicide_prevention": "1-800-273-8255",
                    "message": "It seems you might be going through a difficult time. Please consider reaching out to these professional resources that can help."
                }
            
            return jsonify(response_data)
        else:
            return jsonify({"error": f"API error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500

# Route to get wellness tips
@app.route("/wellness-tips", methods=["GET"])
def wellness_tips():
    category = request.args.get("category", "general")
    
    tips = {
        "general": [
            "Practice deep breathing for 5 minutes each day",
            "Get at least 7-8 hours of sleep",
            "Stay hydrated throughout the day",
            "Take short breaks during work",
            "Practice gratitude by noting three things you're thankful for"
        ],
        "anxiety": [
            "Try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste",
            "Practice progressive muscle relaxation",
            "Focus on your breathing with the 4-7-8 technique",
            "Limit caffeine intake",
            "Challenge negative thoughts with evidence"
        ],
        "stress": [
            "Take a short walk outside",
            "Listen to calming music",
            "Practice mindfulness meditation for 10 minutes",
            "Write down your worries and then set them aside",
            "Connect with a supportive friend or family member"
        ]
    }
    
    return jsonify({
        "category": category,
        "tips": tips.get(category, tips["general"])
    })



if __name__ == '__main__':
    app.run(debug=True)