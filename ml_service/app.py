from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import sys

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from risk_mapping import get_risk_info

app = Flask(__name__)
CORS(app)

# Load artifacts
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'model.joblib')
SYMPTOM_LIST_PATH = os.path.join(os.path.dirname(__file__), 'models', 'symptom_list.joblib')

if os.path.exists(MODEL_PATH) and os.path.exists(SYMPTOM_LIST_PATH):
    model = joblib.load(MODEL_PATH)
    ALL_SYMPTOMS = joblib.load(SYMPTOM_LIST_PATH)
    print(f"Model and {len(ALL_SYMPTOMS)} symptoms loaded successfully.")
else:
    print("Error: Model artifacts not found. Please run train_model.py first.")

def encode_input(symptom_string):
    vector = np.zeros(len(ALL_SYMPTOMS), dtype=np.int8)
    input_text = symptom_string.lower().strip()
    
    # Check for presence of each known symptom in the input text
    matched_count = 0
    for i, s in enumerate(ALL_SYMPTOMS):
        # 1. Direct contains check
        # 2. Substring check for significant words (e.g., "bleeding" matches "spotting or bleeding during pregnancy")
        significant_words = [w for w in s.split() if len(w) > 4]
        if s in input_text or (significant_words and any(w in input_text for w in significant_words)):
            vector[i] = 1
            matched_count += 1
            
    print(f"Matched {matched_count} symptoms for input: '{symptom_text}'")
    return vector.reshape(1, -1)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms_text = data.get('symptoms', '')
        
        if not symptoms_text:
            return jsonify({'error': 'No symptoms provided'}), 400
            
        X = encode_input(symptoms_text)
        
        # Prediction probabilities
        probabilities = model.predict_proba(X)[0]
        confidence = np.max(probabilities)
        label_idx = np.argmax(probabilities)
        disease = model.classes_[label_idx]
        
        # 10% Confidence Guard: Avoid guessing biased common classes for vague input
        if confidence < 0.10:
            return jsonify({
                'disease': 'Inconclusive Result',
                'confidence': float(confidence),
                'risk_level': 'low',
                'advice': 'The symptoms provided are too general. For more accurate results, please use specific terms found in our dataset like "pain during pregnancy" or "chest discomfort".'
            })
        
        # Get enhanced risk level and specific advice
        risk, advice = get_risk_info(disease)
        
        return jsonify({
            'disease': disease.title(),
            'confidence': float(confidence),
            'risk_level': risk,
            'advice': advice
        })
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Restarting Dih Detector ML server (Refined Inference)...")
    app.run(port=5001, debug=False)
