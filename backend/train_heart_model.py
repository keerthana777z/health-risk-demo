# Step 1: Import Libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib

print("Libraries imported successfully!\n")

# Step 2: Load Dataset
df = pd.read_csv("heart_disease_uci.csv")
print("Dataset loaded successfully.\n")

# Step 3: Preprocess Dataset
categorical_cols = df.select_dtypes(include=['object', 'bool']).columns
le = LabelEncoder()
for col in categorical_cols:
    df[col] = le.fit_transform(df[col].astype(str))

# --- NEW: Drop irrelevant columns before defining features and target ---
if 'id' in df.columns and 'dataset' in df.columns:
    df = df.drop(['id', 'dataset'], axis=1)
    print("Dropped 'id' and 'dataset' columns.\n")

# Step 4: Define Features (X) and Target (y)
target_column = "num" # In the previous CSV, this was 'output'
X = df.drop(target_column, axis=1)
y = df[target_column]

# Convert multi-class target to binary (0 = no disease, 1 = disease)
y = np.where(y > 0, 1, 0)

# Step 5: Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Step 6: Train Model (XGBoost)
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    random_state=42,
    use_label_encoder=False,
    eval_metric="logloss"
)
model.fit(X_train, y_train)
print("Model trained successfully!\n")

# Step 7: Evaluation
y_pred = model.predict(X_test)
print("\n--- Model Evaluation ---")
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Step 8: Save the Trained Model
model_filename = '../model/heart_disease_model.pkl'
joblib.dump(model, model_filename)
print(f"\n✅ Model saved successfully to '{model_filename}'")