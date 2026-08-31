# 🏏 Cricket Analytics & Player Performance Prediction System

A Machine Learning-based **Cricket Analytics System** built with **Python and FastAPI** that analyzes cricket player performance and provides data-driven predictions and player classification.

The system provides three major ML functionalities:

* 🏏 **Run Prediction** – Predict player runs based on matches played.
* 👤 **Role Classification** – Classify a player based on runs and wickets.
* 📊 **Player Clustering** – Group similar players using K-Means clustering.

---

## 🚀 Features

### 🏏 1. Player Run Prediction

The system uses a Machine Learning regression model to predict a player's expected runs based on the number of matches played.

**Input:**

* Player ID
* Number of matches

**Output:**

* Player name
* Matches used
* Actual runs
* Predicted runs

---

### 👤 2. Player Role Classification

The system predicts a player's role using their batting and bowling performance.

**Input:**

* Player ID
* Runs
* Wickets

**Output:**

* Player name
* Actual role
* Predicted role
* Runs used
* Wickets used

---

### 📊 3. Player Clustering

K-Means clustering is used to group players based on:

* Runs
* Wickets

This helps identify players with similar performance characteristics.

---

## 🛠️ Technologies Used

| Technology   | Purpose                   |
| ------------ | ------------------------- |
| Python       | Core programming language |
| FastAPI      | Backend REST API          |
| Uvicorn      | ASGI server               |
| Pandas       | Data processing           |
| NumPy        | Numerical operations      |
| Scikit-learn | Machine Learning          |
| Joblib       | Model saving/loading      |
| Pydantic     | API request validation    |
| K-Means      | Player clustering         |

---

## 📁 Project Structure

```text
Cricket-Analytics/
│
├── server.py
├── train_model.py
├── Sports.csv
├── requirements.txt
│
├── models/
│   ├── run_predictor.pkl
│   ├── role_classifier.pkl
│   ├── role_encoder.pkl
│   └── clusterer.pkl
│
├── images/
│   └── player images
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jatinmenariyajatin-dev/house.git
```

```bash
cd house
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/Mac:**

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🤖 Train the Machine Learning Models

If the trained models are not available, run:

```bash
python train_model.py
```

This generates the required model files inside the `models/` folder.

---

## ▶️ Run the API

Start the FastAPI server:

```bash
python server.py
```

The API will run at:

```text
http://localhost:8000
```

---

## 📖 API Documentation

FastAPI automatically provides interactive Swagger documentation.

Open:

```text
http://localhost:8000/docs
```

You can test all API endpoints directly from Swagger UI.

---

## 🔗 API Endpoints

### Get All Players

```http
GET /api/players
```

Returns all players along with their cluster labels.

---

### Predict Runs

```http
POST /api/predict/runs
```

Example request:

```json
{
  "player_id": "P001",
  "matches": 50
}
```

Example response:

```json
{
  "player": "Player Name",
  "used_matches": 50,
  "actual_runs": 1200,
  "predicted_runs": 1350,
  "r2": 0.86
}
```

---

### Predict Player Role

```http
POST /api/predict/role
```

Example request:

```json
{
  "player_id": "P001",
  "runs": 1200,
  "wickets": 25
}
```

Example response:

```json
{
  "player": "Player Name",
  "actual_role": "All-Rounder",
  "predicted_role": "All-Rounder",
  "used_runs": 1200,
  "used_wickets": 25
}
```

---

## 🧠 Machine Learning Models

### Regression

Used for predicting player runs based on matches played.

```text
Matches → Regression Model → Predicted Runs
```

### Classification

Used for predicting player roles based on runs and wickets.

```text
Runs + Wickets → Classification Model → Player Role
```

### K-Means Clustering

Used to group players according to their performance.

```text
Runs + Wickets → K-Means → Player Cluster
```

---

## 📊 Dataset

The project uses `Sports.csv` containing cricket player performance information such as:

* Player ID
* Player Name
* Matches
* Runs
* Wickets
* Player Role
* Image

The dataset is processed using **Pandas** before being used by the Machine Learning models.

---

## 🔄 System Workflow

```text
             Sports.csv
                 │
                 ▼
            Data Processing
            (Pandas/NumPy)
                 │
                 ▼
        Machine Learning Models
        ┌────────┼─────────┐
        ▼        ▼         ▼
    Regression Classification K-Means
        │        │         │
        ▼        ▼         ▼
   Run Prediction Role      Player
                 Prediction Clustering
        └────────┼─────────┘
                 ▼
             FastAPI
                 │
                 ▼
              Frontend
```

---

## 🎯 Project Objectives

* Analyze cricket player performance.
* Predict player runs using Machine Learning.
* Classify players based on their performance.
* Identify similar players using clustering.
* Provide ML functionality through REST APIs.
* Create an easy-to-use backend for cricket analytics applications.

---

## 🔮 Future Enhancements

* Add match outcome prediction.
* Add player performance comparison.
* Add team-level analytics.
* Add live cricket data integration.
* Improve model accuracy with larger datasets.
* Add interactive performance charts and dashboards.
* Deploy the API to a cloud platform.

---

## 👨‍💻 Author

**Jatin Menariya**

GitHub: [jatinmenariyajatin-dev](https://github.com/jatinmenariyajatin-dev)

---

## ⭐ If you Like This Project

Give this repository a ⭐ and feel free to explore or improve the project.
