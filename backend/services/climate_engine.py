import requests
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ClimateEngine:
    # API endpoints
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"
    NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    OPEN_ELEVATION_URL = "https://api.open-elevation.com/api/v1/lookup"
    
    # Configure Gemini
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')

    @classmethod
    def analyze_property(cls, address, asset_value, loan_term):
        print(f"DEBUG: Analyzing {address}...")
        # 1. Geocoding (Nominatim)
        coords = cls._geocode(address)
        if not coords:
            print("DEBUG: Geocoding failed")
            return {"error": "Could not geocode address"}
        
        lat, lon = coords['lat'], coords['lon']
        print(f"DEBUG: Coords: {lat}, {lon}")

        # 2. Get Data from APIs
        elevation = cls._get_elevation(lat, lon)
        print(f"DEBUG: Elevation: {elevation}")
        temp_data = cls._get_temperature_trends(lat, lon)
        print(f"DEBUG: Temp data points: {len(temp_data)}")
        precip_data = cls._get_precipitation_data(lat, lon)
        print(f"DEBUG: Precip data points: {len(precip_data)}")

        # 3. Calculate Scores
        flood_risk = cls._calculate_flood_risk(elevation, precip_data)
        heat_risk = cls._calculate_heat_risk(temp_data)
        storm_risk = cls._calculate_storm_risk(precip_data)
        sea_level_risk = cls._calculate_sea_level_risk(elevation, lat, lon)

        # Apply scoring formula
        raw_risk = (
            flood_risk * 0.3 +
            heat_risk * 0.25 +
            storm_risk * 0.25 +
            sea_level_risk * 0.2
        )
        climate_score = max(0, min(100, 100 - (raw_risk * 10)))

        # 4. Get AI Insights (Gemini)
        ai_insights = cls._get_ai_insights(
            address, asset_value, loan_term, 
            climate_score, flood_risk, heat_risk, storm_risk, sea_level_risk
        )

        return {
            "latitude": lat,
            "longitude": lon,
            "elevation": elevation,
            "climate_score": round(climate_score, 2),
            "risk_level": cls._get_risk_level(climate_score),
            "environmental_composition": {
                "Flood Risk": round(flood_risk, 2),
                "Heat Risk": round(heat_risk, 2),
                "Storm Risk": round(storm_risk, 2),
                "Sea Level Rise": round(sea_level_risk, 2)
            },
            "ai_insights": ai_insights['explanation'],
            "loan_recommendation": ai_insights['recommendation'],
            "projections": cls._generate_projections(climate_score, int(loan_term))
        }

    @classmethod
    def _geocode(cls, address):
        headers = {'User-Agent': 'ClimateCreditScoreEngine/1.0'}
        params = {'q': address, 'format': 'json', 'limit': 1}
        try:
            response = requests.get(cls.NOMINATIM_URL, params=params, headers=headers)
            data = response.json()
            if data:
                return {'lat': float(data[0]['lat']), 'lon': float(data[0]['lon'])}
        except Exception as e:
            print(f"Geocoding error: {e}")
        return None

    @classmethod
    def _get_elevation(cls, lat, lon):
        params = {'locations': f"{lat},{lon}"}
        try:
            response = requests.get(cls.OPEN_ELEVATION_URL, params=params)
            data = response.json()
            return data['results'][0]['elevation']
        except:
            return 10.0 # Fallback

    @classmethod
    def _get_temperature_trends(cls, lat, lon):
        # Fetching historical data for last 2 years to check trends
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": "2022-01-01", "end_date": "2023-12-31",
            "daily": "temperature_2m_max", "timezone": "GMT"
        }
        try:
            response = requests.get(cls.OPEN_METEO_URL, params=params)
            return response.json().get('daily', {}).get('temperature_2m_max', [])
        except:
            return []

    @classmethod
    def _get_precipitation_data(cls, lat, lon):
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": "20230101", "end_date": "20231231",
            "parameters": "PRECTOTCORR", "community": "AG", "format": "JSON"
        }
        try:
            response = requests.get(cls.NASA_POWER_URL, params=params)
            data = response.json()
            if 'properties' in data and 'parameter' in data['properties']:
                daily_precip = data['properties']['parameter']['PRECTOTCORR']
                return list(daily_precip.values())
            print(f"DEBUG: NASA POWER unexpected response: {data.get('messages', 'No message')}")
            return []
        except Exception as e:
            print(f"DEBUG: NASA POWER error: {e}")
            return []

    @staticmethod
    def _calculate_flood_risk(elevation, precip_data):
        # Simple heuristic: low elevation + high precip = high flood risk
        avg_precip = sum(precip_data) / len(precip_data) if precip_data else 5.0
        elevation_factor = max(0, 10 - (elevation / 5)) # Higher risk if elevation < 50m
        precip_factor = min(10, avg_precip * 0.5)
        return (elevation_factor * 0.6 + precip_factor * 0.4)

    @staticmethod
    def _calculate_heat_risk(temp_data):
        if not temp_data: return 5.0
        avg_max_temp = sum(temp_data) / len(temp_data)
        # Higher risk if avg max temp > 30C
        return min(10, max(0, (avg_max_temp - 20) * 0.5))

    @staticmethod
    def _calculate_storm_risk(precip_data):
        if not precip_data: return 5.0
        # High variability in precipitation indicates storm vulnerability
        max_precip = max(precip_data) if precip_data else 0
        return min(10, max_precip / 10)

    @staticmethod
    def _calculate_sea_level_risk(elevation, lat, lon):
        # Only relevant for coastal areas (simplified check)
        is_coastal = abs(lat) < 60 # Rough approximation
        if not is_coastal: return 0.0
        return max(0, min(10, 10 - (elevation / 2))) # Critical if elevation < 20m

    @staticmethod
    def _get_risk_level(score):
        if score >= 80: return "Low"
        if score >= 50: return "Medium"
        if score >= 30: return "High"
        return "Extreme"

    @classmethod
    def _get_ai_insights(cls, address, asset_value, loan_term, score, flood, heat, storm, sea):
        prompt = f"""
        Act as a Climate Risk Analyst and Financial Advisor.
        Analyze this property:
        - Address: {address}
        - Asset Value: ${asset_value}
        - Loan Term: {loan_term} years
        - Overall Climate Score: {score}/100
        - Risk Factors: Flood({flood}/10), Heat({heat}/10), Storm({storm}/10), Sea Level({sea}/10)
        
        Provide a concise response in two parts:
        1. "explanation": A detailed but brief climate risk analysis for this location.
        2. "recommendation": A bank-level loan recommendation (Approved, Approved with Adjustments, or Risky).
        Format the response as a JSON string with keys 'explanation' and 'recommendation'.
        """
        try:
            response = cls.model.generate_content(prompt)
            import json
            # Clean up the response text in case it contains markdown code blocks
            res_text = response.text.strip().replace('```json', '').replace('```', '')
            return json.loads(res_text)
        except Exception as e:
            print(f"Gemini error: {e}")
            return {
                "explanation": "Limited data available for specific AI analysis. Local risk assessment recommended.",
                "recommendation": "Manual Review Required"
            }

    @staticmethod
    def _generate_projections(score, loan_term):
        projections = []
        for year in range(2025, 2025 + int(loan_term) + 1, 5):
            year_score = max(0, score - (0.7 * (year - 2025)))
            projections.append({"year": year, "score": round(year_score, 2)})
        return projections
