# train_model.py
import pandas as pd
import joblib
import os
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score

# ---------- 1. Load data ----------
df = pd.read_csv("Sports.csv")
print(f"Loaded {len(df)} players.")

# ---------- 2. Create models folder ----------
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------- 3. Regression: Runs ~ Matches ----------
X_reg = df[["Matches"]]
y_reg = df["Runs"]
reg_model = LinearRegression()
reg_model.fit(X_reg, y_reg)

# Evaluate (optional)
y_pred_reg = reg_model.predict(X_reg)
r2 = r2_score(y_reg, y_pred_reg)
print(f"✅ Regression R² = {r2:.3f}")

# Save
joblib.dump(reg_model, os.path.join(MODEL_DIR, "run_predictor.pkl"))

# ---------- 4. Classification: Role ~ Runs + Wickets ----------
# Encode target
le = LabelEncoder()
df["RoleEnc"] = le.fit_transform(df["Role"])

X_clf = df[["Runs", "Wickets"]]
y_clf = df["RoleEnc"]

clf_model = KNeighborsClassifier(n_neighbors=3)
clf_model.fit(X_clf, y_clf)

# Evaluate (split to get a more realistic accuracy)
X_train, X_test, y_train, y_test = train_test_split(
    X_clf, y_clf, test_size=0.2, random_state=42
)
clf_model.fit(X_train, y_train)   # refit on training set
y_pred_clf = clf_model.predict(X_test)
acc = accuracy_score(y_test, y_pred_clf)
print(f"✅ Classification accuracy = {acc:.2f}")

# Save model and encoder
joblib.dump(clf_model, os.path.join(MODEL_DIR, "role_classifier.pkl"))
joblib.dump(le, os.path.join(MODEL_DIR, "role_encoder.pkl"))

# ---------- 5. Clustering (optional, for frontend badges) ----------
# We'll compute clusters on the fly in the backend, but we can also save the cluster labels.
# For simplicity, we'll just save the KMeans model so we can reuse it.
features = df[["Runs", "Wickets"]].values
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans.fit(features)
joblib.dump(kmeans, os.path.join(MODEL_DIR, "clusterer.pkl"))

# Also save cluster labels for each player (optional)
df["cluster"] = kmeans.labels_
df.to_csv("Sports_with_clusters.csv", index=False)   # for reference

print("✅ All models saved successfully!")