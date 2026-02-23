

# 🌍 Climate Credit Score Engine

AI-Powered Climate Risk Intelligence Platform for Financial Institutions & Borrowers

---

## 🚀 Overview

**Climate Credit Score Engine** is a full-stack climate risk assessment platform that evaluates how environmental and climate factors impact property-based lending decisions.

The system analyzes a property’s geographic location using climate models and generates a **Climate Credit Score**, helping banks, lenders, and investors make smarter, climate-aware financial decisions.

This project bridges **FinTech + ClimateTech + AI** by converting environmental risk into financial intelligence.

---

## 🎯 Problem Statement

Traditional credit scoring models ignore climate risks such as:

* Flood exposure
* Heat waves
* Sea-level rise
* Storm frequency
* Environmental degradation

As climate risks increase, lenders face hidden financial exposure.

👉 Our solution introduces a **Climate Credit Score** to quantify environmental risk for loans and assets.

---

## 💡 Solution

The platform:

1. Accepts property **address or coordinates**
2. Converts location → latitude & longitude
3. Fetches climate & environmental indicators
4. Runs risk analysis algorithms
5. Generates a climate-adjusted credit score
6. Visualizes risk through interactive dashboards

---

## 🧠 Key Features

### 📍 Property Climate Analysis

* Address or coordinate-based analysis
* Live map visualization
* Location fetch & geocoding

### 📊 Climate Risk Dashboard

* Regional Risk Profile (Radar Chart)
* Historical Temperature Trends
* Environmental Composition Analysis

### 💳 Climate Credit Score

* AI-based scoring engine
* Loan adjustment recommendations
* Risk classification (Low / Medium / High)

### 🗂 Portfolio Management

* Multi-property risk overview
* Asset distribution visualization
* Portfolio climate exposure scoring

### 📄 Reporting

* Downloadable analysis reports
* Portfolio summaries

---

## 🏗️ System Architecture

```
Frontend (React + Vite)
        ↓
API Layer (FastAPI / Flask Backend)
        ↓
Climate Analysis Engine
        ↓
External APIs (Geocoding + Climate Data)
```

---

## 🛠 Tech Stack

### Frontend

* React 19
* Vite
* React Router
* React Leaflet (Maps)
* Chart.js
* Tailwind / Custom CSS UI

### Backend

* Python (FastAPI / Flask)
* REST API Architecture
* Climate Risk Calculation Engine

### Data & APIs

* OpenStreetMap / Nominatim (Geocoding)
* Climate datasets (simulated / API-ready)
* Gemini API (AI reasoning support)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/climate-credit-score-engine.git
cd climate-credit-score-engine
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python app.py
```

Backend runs at:

```
http://127.0.0.1:5001
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## ▶️ Run Frontend + Backend Together

Install concurrently:

```bash
npm install concurrently --save-dev
```

Add script in `package.json`:

```json
"start": "concurrently \"npm run dev\" \"cd backend && python app.py\""
```

Run:

```bash
npm run start
```

---

## 🔑 Environment Variables

Create `.env` file:

```
VITE_API_URL=http://127.0.0.1:5001
GEMINI_API_KEY=your_key_here
```

---

## 📡 API Endpoints

### Health Check

```
GET /
```

Response:

```json
{
  "name": "Climate Credit Score Engine API",
  "status": "online"
}
```

---

### Analyze Property

```
POST /api/analyze
```

Request:

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "asset_value": 1000000,
  "loan_term": 30
}
```

Response:

```json
{
  "climate_score": 72,
  "risk_profile": {},
  "temperature_trend": [],
  "environmental_composition": {}
}
```

---

## 📈 Climate Credit Score Logic (Concept)

Score is derived using:

```
Climate Score =
100
- Flood Risk Weight
- Heat Risk Weight
- Storm Exposure
- Sea Level Vulnerability
+ Environmental Stability
```

---

## 🎨 UI Highlights

* Dark fintech theme
* Glassmorphism cards
* Interactive charts
* Real-time map updates
* Startup-grade dashboard design

---

## 🔮 Future Improvements

* Real climate APIs integration (NASA / Open-Meteo)
* ML-based risk prediction
* Bank API integrations
* ESG investment scoring
* Satellite imagery analysis

---

## 👨‍💻 Team

**Carbon Coders**

Built for Hackathon Innovation 🚀

---

## 📜 License

MIT License — Free for educational & research use.

---

## ⭐ Why This Project Matters

Climate risk will redefine finance.

This platform enables:

* Climate-aware lending
* Sustainable investments
* Risk-resilient portfolios
* ESG compliance

---

## ❤️ Acknowledgements

* OpenStreetMap
* Climate Data Communities
* Open-source ecosystem


