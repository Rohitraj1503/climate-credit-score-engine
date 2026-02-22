# Climate Credit Score Engine

A full-stack web application to evaluate long-term climate risks for properties and generate a Climate Credit Score for financial institutions.

## Tech Stack
- **Backend:** Python (Flask)
- **Database:** Firebase Firestore
- **Frontend:** HTML, CSS, JavaScript
- **Visualization:** Chart.js, Leaflet.js

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- node.js (optional, only if you expand to React/Vue)
- Firebase Account (for `serviceAccountKey.json`)

### 2. Installation

1.  Clone or download the repository.
2.  Navigate to the project directory:
    ```bash
    cd climate-credit-score-engine
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 3. Firebase Configuration
1.  Go to your Firebase Project Settings > Service Accounts.
2.  Generate a new private key (`.json` file).
3.  Rename it to `serviceAccountKey.json` and place it in the root of this project (next to `app.py`).
    - *Note:* The app handles missing credentials gracefully for demo purposes (database features will be disabled).

### 4. Running the App
1.  Start the Flask server:
    ```bash
    python app.py
    ```
    Or if you have `flask` installed globally:
    ```bash
    flask run
    ```
2.  Open your browser and search for the localhost URL (usually `http://127.0.0.1:5000`).

## Features
-   **Analysis Engine:** Evaluate properties by location.
-   **Climate Credit Score:** 0-100 rating based on Flood, Storm, Heat, and Sea Level risks.
-   **Portfolio Dashboard:** View aggregate risk across multiple assets.
-   **Interactive Maps:** Visual location confirmation and portfolio mapping.
