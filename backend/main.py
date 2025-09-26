import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import cohere
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# --- Initialize Clients ---
co = cohere.Client(COHERE_API_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# --- Initialize FastAPI ---
app = FastAPI()

# --- CORS ---
origins = [
    "http://localhost:3000",
    "https://health-risk.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Models ---
try:
    # Use paths relative to the current file for robustness
    base_dir = os.path.dirname(os.path.abspath(__file__))
    diabetes_model = joblib.load(os.path.join(base_dir, "../model/diabetes_model.pkl"))
    heart_disease_model = joblib.load(os.path.join(base_dir, "../model/heart_disease_model.pkl"))
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    diabetes_model = None
    heart_disease_model = None

# --- Pydantic Models ---
class DiabetesFeatures(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: int
    SkinThickness: int
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int

class HeartFeatures(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalch: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

# --- Cohere Explanation Helper ---
def get_ai_explanation(user_input: dict, model_name: str, prediction: str, probability: str):
    try:
        prompt = (
            f"Explain in simple terms for a patient why a prediction of '{prediction}' "
            f"with probability {probability} was made for '{model_name}'. "
            f"The patient's data is: {user_input}. Keep it concise (2-3 sentences)."
        )

        # Using the "command" model as requested.
        response = co.chat(
            model="command-a-03-2025", # Use a current, supported model
            message=prompt # Use 'message' for the new version
        )
        
        # The new response structure
        return response.text.strip()
            
    except Exception as e:
        error_message = f"AI Error: {str(e)}"
        print(f"❌ {error_message}")
        return error_message

# --- Routes ---
@app.get("/")
def root():
    return {"message": "🚀 Health Risk Prediction API is running!"}

@app.post("/predict/diabetes")
def predict_diabetes(features: DiabetesFeatures):
    if not diabetes_model:
        return {"error": "Diabetes model not loaded"}

    feature_order = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                     "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    input_df = pd.DataFrame([features.dict()])[feature_order]

    pred_raw = diabetes_model.predict(input_df)[0]
    pred_prob = diabetes_model.predict_proba(input_df)[0]

    prediction_label = "High Risk" if pred_raw == 1 else "Low Risk"
    probability_str = f"{max(pred_prob) * 100:.2f}%"
    explanation = get_ai_explanation(features.dict(), "Type 2 Diabetes", prediction_label, probability_str)

    return {
        "prediction": int(pred_raw),
        "probability": float(max(pred_prob)),
        "explanation": explanation
    }

@app.post("/predict/heart")
def predict_heart(features: HeartFeatures):
    if not heart_disease_model:
        return {"error": "Heart model not loaded"}

    input_df = pd.DataFrame([features.dict()])
    pred_raw = heart_disease_model.predict(input_df)[0]
    pred_prob = heart_disease_model.predict_proba(input_df)[0]

    prediction_label = "High Risk" if pred_raw == 1 else "Low Risk"
    probability_str = f"{max(pred_prob) * 100:.2f}%"
    explanation = get_ai_explanation(features.dict(), "Heart Disease", prediction_label, probability_str)

    return {
        "prediction": int(pred_raw),
        "probability": float(max(pred_prob)),
        "explanation": explanation
    }

@app.get("/analytics/average_probability")
def get_average_probability():
    try:
        response = supabase_admin.from_("predictions").select("probability").execute()
        if response.data:
            df = pd.DataFrame(response.data)
            return {"average_probability": float(df["probability"].mean())}
        return {"average_probability": 0}
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        return {"error": "Failed to fetch analytics"}

