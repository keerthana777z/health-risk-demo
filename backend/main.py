import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# --- Configuration ---
# WARNING: The SERVICE_KEY is a secret and should be protected.
# For a real app, use environment variables.
SUPABASE_URL = "https://pxuochjvbgkermlpbvea.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dW9jaGp2YmdrZXJtbHBidmVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzQxNSwiZXhwIjoyMDc0MzEzNDE1fQ.EIWFEKhdJq8wPTeqGCO-vxku5hMj3ckKA2O7RcRrrKQ"
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize the FastAPI app
app = FastAPI()

# --- CORS Middleware ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Trained Models ---
try:
    diabetes_model = joblib.load('../model/diabetes_model.pkl')
    heart_disease_model = joblib.load('../model/heart_disease_model.pkl')
except Exception as e:
    print(f"Error loading models: {e}")
    diabetes_model = None
    heart_disease_model = None

# --- Pydantic Models ---
class DiabetesFeatures(BaseModel):
    # ... (same as before)
    Pregnancies: int; Glucose: float; BloodPressure: int; SkinThickness: int;
    Insulin: float; BMI: float; DiabetesPedigreeFunction: float; Age: int

class HeartFeatures(BaseModel):
    # ... (same as before)
    age: int; sex: int; cp: int; trestbps: int; chol: int; fbs: int;
    restecg: int; thalch: int; exang: int; oldpeak: float; slope: int;
    ca: int; thal: int

# --- API Endpoints ---
@app.post("/predict/diabetes")
def predict_diabetes(features: DiabetesFeatures):
    # ... (same as before)
    if diabetes_model is None: return {"error": "Model not loaded"}
    feature_order = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    input_df = pd.DataFrame([features.dict()])[feature_order]
    pred_raw = diabetes_model.predict(input_df)[0]
    pred_prob = diabetes_model.predict_proba(input_df)[0]
    return {"prediction": int(pred_raw), "probability": float(max(pred_prob))}

@app.post("/predict/heart")
def predict_heart(features: HeartFeatures):
    # ... (same as before)
    if heart_disease_model is None: return {"error": "Model not loaded"}
    input_df = pd.DataFrame([features.dict()])
    pred_raw = heart_disease_model.predict(input_df)[0]
    pred_prob = heart_disease_model.predict_proba(input_df)[0]
    return {"prediction": int(pred_raw), "probability": float(max(pred_prob))}

# --- NEW ADMIN ENDPOINT ---
@app.get("/analytics/average_probability")
def get_average_probability():
    # This client uses the service_role key to bypass RLS and fetch ALL data
    response = supabase_admin.from_('predictions').select("probability").execute()
    
    if response.data:
        # Use pandas to easily calculate the average
        df = pd.DataFrame(response.data)
        average = df['probability'].mean()
        return {"average_probability": float(average)}
        
    # Handle case with no data or an error
    return {"average_probability": 0}