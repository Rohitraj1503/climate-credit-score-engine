from flask import Flask, render_template, request, jsonify
from firebase_service import init_firebase, get_property, save_property, get_portfolio, get_all_properties
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize Firebase
init_firebase()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/results')
@app.route('/results')
def results():
    property_id = request.args.get('id')
    
    # Default fallback data
    score = 72
    risks = {'flood': 'Medium', 'heat': 'High', 'storm': 'Low', 'sea_level': 'Low'}
    timeline = [65, 59, 80, 81, 56, 55, 40]
    
    if property_id:
        property_data = get_property(property_id)
        if property_data and 'result' in property_data:
            result = property_data['result']
            score = result.get('score', score)
            risks = result.get('risks', risks)
            timeline = result.get('timeline', timeline)

    return render_template('results.html', score=score, risks=risks, timeline=timeline)

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_property():
    data = request.json
    # TODO: Implement actual climate scoring logic
    # For now, return dummy data
    location = data.get('location')
    
    # Mock score generation based on location length (random but deterministic for demo)
    score = 85 if len(location) % 2 == 0 else 45 
    
    result = {
        'score': score,
        'risks': {
            'flood': 'Low',
            'storm': 'Medium',
            'heatwave': 'High' if score < 50 else 'Low',
            'sea_level': 'Low'
        },
        'timeline': [20, 30, 45, 60] # Projected risk
    }
    
    # Save to Firestore
    # Save to Firestore
    doc_id = save_property(data, result)
    
    # Return ID so frontend can redirect
    result['id'] = doc_id
    
    return jsonify(result)

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio_data():
    properties = get_all_properties()
    return jsonify(properties)

if __name__ == '__main__':
    app.run(debug=True)
