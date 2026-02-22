from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.property import PropertyAnalysis
from services.climate_engine import ClimateEngine
from database import db

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    lat = float(data.get('lat', 0))
    lng = float(data.get('lng', 0))
    asset_value = float(data.get('asset_value', 0))
    loan_term = int(data.get('loan_term', 30))
    property_name = data.get('property_name', f"Property at {lat}, {lng}")
    address = data.get('address', f"{lat}, {lng}")

    # Deterministic Risk Logic (based on senior engineer spec)
    flood_val = abs(lat % 1) * 100
    heat_val = abs(lng % 1) * 100
    storm_val = (abs(lat + lng) % 1) * 100
    sea_level_val = max(0, float(100 - abs(lat) * 2))

    def get_level(val):
        if val > 70: return "High"
        if val > 40: return "Medium"
        return "Low"

    risks = {
        "flood": {"value": round(flood_val, 1), "level": get_level(flood_val)},
        "heat": {"value": round(heat_val, 1), "level": get_level(heat_val)},
        "storm": {"value": round(storm_val, 1), "level": get_level(storm_val)},
        "sea_level": {"value": round(sea_level_val, 1), "level": get_level(sea_level_val)}
    }

    # Deterministic Projection (2030-2070)
    base_proj = (lat + lng) % 50
    projection = [
        {"year": 2030, "risk": round(base_proj + 20, 1)},
        {"year": 2040, "risk": round(base_proj + 35, 1)},
        {"year": 2050, "risk": round(base_proj + 55, 1)},
        {"year": 2060, "risk": round(base_proj + 70, 1)},
        {"year": 2070, "risk": round(base_proj + 85, 1)}
    ]

    # Calculate overall score (weighted average inverse)
    avg_risk = (flood_val + heat_val + storm_val + sea_level_val) / 4
    calculated_score = round(100 - (avg_risk * 0.5), 1)

    # Persist to database for Portfolio
    analysis = PropertyAnalysis(
        property_name=property_name,
        address=address,
        latitude=lat,
        longitude=lng,
        asset_value=asset_value,
        loan_term=loan_term,
        climate_score=calculated_score,
        risk_level=get_level(avg_risk * 1.4), # Scaled mapping to overall risk level
        risk_factors=risks,
        projections=projection,
        ai_insights=f"Analysis for {property_name} shows a climate credit score of {calculated_score}.",
        loan_recommendation="Approve" if calculated_score > 60 else "Review Required"
    )
    
    db.session.add(analysis)
    db.session.commit()

    return jsonify({
        "risk_factors": risks,
        "projection": projection,
        "score": calculated_score,
        "id": analysis.id,
        "location": {"lat": lat, "lng": lng}
    }), 200

@analysis_bp.route('/analyze-property', methods=['POST'])
@jwt_required(optional=True) # Allow guests to analyze, but logged in users can save to portfolio
def analyze_property():
    data = request.get_json()
    
    address = data.get('address')
    property_name = data.get('property_name', address) # Fallback to address if name not provided
    asset_value = data.get('asset_value', 100000)
    loan_term = data.get('loan_term', 30)
    
    if not address:
        return jsonify({"msg": "Address or coordinates are required"}), 400
        
    # Perform analysis using Service
    analysis_result = ClimateEngine.analyze_property(address, asset_value, loan_term)
    
    if "error" in analysis_result:
        return jsonify(analysis_result), 400
        
    # Save analysis to database
    analysis = PropertyAnalysis(
        property_name=property_name,
        address=address,
        latitude=analysis_result.get('latitude'), # Use lat from engine
        longitude=analysis_result.get('longitude'), # Use lon from engine
        asset_value=asset_value,
        loan_term=loan_term,
        climate_score=analysis_result['climate_score'],
        risk_level=analysis_result['risk_level'],
        risk_factors=analysis_result['environmental_composition'],
        projections=analysis_result['projections'],
        ai_insights=analysis_result.get('ai_insights'),
        loan_recommendation=analysis_result.get('loan_recommendation')
    )
    
    db.session.add(analysis)
    db.session.commit()
    
    return jsonify(analysis.to_dict()), 201

@analysis_bp.route('/results/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    analysis = PropertyAnalysis.query.get_or_404(analysis_id)
    return jsonify(analysis.to_dict()), 200

@analysis_bp.route('/geocode', methods=['GET'])
def geocode():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
        
    print(f"DEBUG: Geocoding request for: {query}")
    coords = ClimateEngine._geocode(query)
    
    if not coords:
        return jsonify({"error": "Location not found"}), 404
        
    # Get display name if possible, or use query as fallback
    # Nominatim returns full data in _geocode if we modify it slightly, 
    # but let's stick to the simplest working version requested.
    return jsonify({
        "lat": coords['lat'],
        "lng": coords['lon'],
        "display_name": query
    }), 200
