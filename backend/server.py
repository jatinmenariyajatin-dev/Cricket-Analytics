# server.py
import pandas as pd
import joblib
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles   # <-- यह import जोड़ें
from pydantic import BaseModel

# ---------- FastAPI app ----------
app = FastAPI(title="Cricket Analytics API", version="1.0")

# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Static Images Mount ----------
# मान लें कि आपकी images 'images/' folder में हैं (जो backend/ के अंदर है)
# CSV के 'Image' column में "images/a.jpg" जैसा path है
# तो URL बनेगा: http://localhost:8000/images/a.jpg
if os.path.exists("images"):
    app.mount("/images", StaticFiles(directory="images"), name="images")
else:
    print("⚠️ 'images/' folder not found. Please create it and add your .jpg files.")

# ---------- Load data and models ----------
DATA_FILE = "Sports.csv"
MODEL_DIR = "models"

# Check if data exists
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"❌ {DATA_FILE} not found. Please place it in the same folder.")

df = pd.read_csv(DATA_FILE)

# Check if models are trained
required_models = ["run_predictor.pkl", "role_classifier.pkl", "role_encoder.pkl", "clusterer.pkl"]
missing = [m for m in required_models if not os.path.exists(os.path.join(MODEL_DIR, m))]

if missing:
    raise FileNotFoundError(
        f"❌ Missing model(s): {missing}. Please run 'python train_model.py' first."
    )

# Load models
reg_model = joblib.load(os.path.join(MODEL_DIR, "run_predictor.pkl"))
clf_model = joblib.load(os.path.join(MODEL_DIR, "role_classifier.pkl"))
le = joblib.load(os.path.join(MODEL_DIR, "role_encoder.pkl"))
kmeans = joblib.load(os.path.join(MODEL_DIR, "clusterer.pkl"))

# Add cluster labels to dataframe (for frontend display)
features = df[["Runs", "Wickets"]].values
df["cluster"] = kmeans.predict(features)

# ---------- Pydantic models for request bodies ----------
class PredictRunsRequest(BaseModel):
    player_id: str
    matches: int = None   # optional override

class ClassifyRoleRequest(BaseModel):
    player_id: str
    runs: int = None
    wickets: int = None

# ---------- API Endpoints ----------
@app.get("/api/players")
def get_players():
    """Return all players with cluster labels."""
    return df.to_dict(orient="records")

@app.post("/api/predict/runs")
def predict_runs(req: PredictRunsRequest):
    """Predict runs for a player based on matches."""
    player = df[df["PlayerID"] == req.player_id]
    if player.empty:
        raise HTTPException(404, "Player not found")
    
    actual_matches = int(player["Matches"].iloc[0])
    actual_runs = int(player["Runs"].iloc[0])
    name = player["Name"].iloc[0]
    
    matches_used = req.matches if req.matches is not None else actual_matches
    pred = int(round(reg_model.predict([[matches_used]])[0]))
    
    return {
        "player": name,
        "used_matches": matches_used,
        "actual_runs": actual_runs,
        "predicted_runs": pred,
        "r2": 0.86   # you can replace with actual R² if computed during training
    }

@app.post("/api/predict/role")
def classify_role(req: ClassifyRoleRequest):
    """Classify player role based on runs and wickets."""
    player = df[df["PlayerID"] == req.player_id]
    if player.empty:
        raise HTTPException(404, "Player not found")
    
    actual_runs = int(player["Runs"].iloc[0])
    actual_wickets = int(player["Wickets"].iloc[0])
    name = player["Name"].iloc[0]
    actual_role = player["Role"].iloc[0]
    
    runs_used = req.runs if req.runs is not None else actual_runs
    wickets_used = req.wickets if req.wickets is not None else actual_wickets
    
    pred_enc = clf_model.predict([[runs_used, wickets_used]])[0]
    pred_role = le.inverse_transform([pred_enc])[0]
    
    return {
        "player": name,
        "actual_role": actual_role,
        "predicted_role": pred_role,
        "used_runs": runs_used,
        "used_wickets": wickets_used
    }

# ---------- Root endpoint (optional) ----------
@app.get("/")
def root():
    return {"message": "Cricket Analytics API is running. Go to /docs for Swagger UI."}

# ---------- Run the server ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)