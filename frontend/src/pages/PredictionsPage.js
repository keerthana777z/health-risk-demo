import React, { useState } from 'react';
import Modal from 'react-modal';
import { supabase } from '../supabaseClient';
import './PredictionsPage.css';

// This makes sure the modal works correctly with screen readers
Modal.setAppElement('#root');

const initialFormState = {
  // Diabetes fields
  age_diabetes: '', bmi: '', glucose: '', insulin: '', blood_pressure: '',
  // Heart Disease fields
  age_heart: '', sex: '1', cp: '0', trestbps: '', chol: '', fbs: '0', restecg: '0',
  thalch: '', exang: '0', oldpeak: '', slope: '0', ca: '0', thal: '0'
};

const PredictionsPage = ({ session }) => {
  const [activeTab, setActiveTab] = useState('diabetes');
  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');

    let payload = {};

    if (type === 'diabetes') {
      const bpString = formData.blood_pressure || '120/80';
      payload = {
        Age: parseInt(formData.age_diabetes),
        BMI: parseFloat(formData.bmi),
        BloodPressure: parseInt(bpString.split('/')[1] || 80, 10),
        Glucose: parseFloat(formData.glucose),
        Insulin: parseFloat(formData.insulin),
        Pregnancies: 2, SkinThickness: 20, DiabetesPedigreeFunction: 0.5,
      };
    } else if (type === 'heart') {
      payload = {
        age: parseInt(formData.age_heart),
        sex: parseInt(formData.sex),
        cp: parseInt(formData.cp),
        trestbps: parseInt(formData.trestbps),
        chol: parseInt(formData.chol),
        fbs: parseInt(formData.fbs),
        restecg: parseInt(formData.restecg),
        thalch: parseInt(formData.thalch),
        exang: parseInt(formData.exang),
        oldpeak: parseFloat(formData.oldpeak),
        slope: parseInt(formData.slope),
        ca: parseInt(formData.ca),
        thal: parseInt(formData.thal),
      };
    }

    try {
const response = await fetch(`https://health-risk-api-sfp6.onrender.com/predict/${type}`, {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response failed');
      
      const predictionResult = await response.json();
      setResult({ ...predictionResult, type });

      if (session) {
        const { error } = await supabase.from('predictions').insert([{
          user_id: session.user.id,
          model_name: type,
          input: payload,
          prediction: predictionResult.prediction,
          probability: predictionResult.probability,
        }]);
        if (error) console.error("Error saving to Supabase:", error);
      }
    } catch (error) { // The fix is adding the curly braces here
      console.error("Error during prediction:", error);
      setApiError("Failed to get prediction. Please ensure the backend is running.");
    }

    setLoading(false);
    setIsResultModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsResultModalOpen(false);
    setResult(null);
    setApiError('');
    setFormData(initialFormState);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'diabetes':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'diabetes')}>
            <h2>Diabetes Risk Assessment</h2>
            <div className="form-grid">
              <div className="form-group"><label>Age (years)</label><input type="number" name="age_diabetes" value={formData.age_diabetes} onChange={handleInputChange} placeholder="e.g. 35" required /></div>
              <div className="form-group"><label>BMI (kg/m²)</label><input type="number" name="bmi" value={formData.bmi} onChange={handleInputChange} step="0.1" placeholder="e.g. 24.8" required /></div>
              <div className="form-group"><label>Glucose Level (mg/dL)</label><input type="number" name="glucose" value={formData.glucose} onChange={handleInputChange} placeholder="e.g. 95" required /></div>
              <div className="form-group"><label>Insulin Level (μU/mL)</label><input type="number" name="insulin" value={formData.insulin} onChange={handleInputChange} step="0.1" placeholder="e.g. 8.5" required /></div>
              <div className="form-group form-group-full"><label>Blood Pressure (e.g., 120/80 mmHg)</label><input type="text" name="blood_pressure" value={formData.blood_pressure} onChange={handleInputChange} placeholder="e.g. 120/80" required /></div>
            </div>
            <button type="submit" className="btn btn-primary calculate-btn" disabled={loading}>{loading ? 'Calculating...' : 'Calculate Diabetes Risk'}</button>
          </form>
        );
      case 'heart':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'heart')}>
            <h2>Heart Disease Risk Assessment</h2>
            <div className="form-grid">
              <div className="form-group"><label>Age</label><input type="number" name="age_heart" value={formData.age_heart} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Sex</label><select name="sex" value={formData.sex} onChange={handleInputChange}><option value="1">Male</option><option value="0">Female</option></select></div>
              <div className="form-group"><label>Chest Pain Type</label><select name="cp" value={formData.cp} onChange={handleInputChange}><option value="0">Typical Angina</option><option value="1">Atypical Angina</option><option value="2">Non-anginal Pain</option><option value="3">Asymptomatic</option></select></div>
              <div className="form-group"><label>Resting Blood Pressure</label><input type="number" name="trestbps" value={formData.trestbps} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Serum Cholesterol (mg/dl)</label><input type="number" name="chol" value={formData.chol} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Fasting Blood Sugar  120 mg/dl</label><select name="fbs" value={formData.fbs} onChange={handleInputChange}><option value="1">True</option><option value="0">False</option></select></div>
              <div className="form-group"><label>Resting ECG</label><select name="restecg" value={formData.restecg} onChange={handleInputChange}><option value="0">Normal</option><option value="1">ST-T wave abnormality</option><option value="2">Left ventricular hypertrophy</option></select></div>
              <div className="form-group"><label>Max Heart Rate Achieved</label><input type="number" name="thalch" value={formData.thalch} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Exercise Induced Angina</label><select name="exang" value={formData.exang} onChange={handleInputChange}><option value="1">Yes</option><option value="0">No</option></select></div>
              <div className="form-group"><label>ST depression (oldpeak)</label><input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Slope of peak exercise ST</label><select name="slope" value={formData.slope} onChange={handleInputChange}><option value="0">Upsloping</option><option value="1">Flat</option><option value="2">Downsloping</option></select></div>
              <div className="form-group"><label>Major vessels colored</label><input type="number" name="ca" value={formData.ca} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Thalassemia</label><select name="thal" value={formData.thal} onChange={handleInputChange}><option value="0">Null</option><option value="1">Normal</option><option value="2">Fixed Defect</option><option value="3">Reversable Defect</option></select></div>
            </div>
            <button type="submit" className="btn btn-green calculate-btn" disabled={loading}>{loading ? 'Calculating...' : 'Assess Heart Disease Risk'}</button>
          </form>
        );
      case 'hypertension':
        return <div><h2>Hypertension form placeholder</h2></div>;
      default:
        return null;
    }
  };

  return (
    <div className="predictions-page">
      <div className="page-header">
        <h1>Health Risk Predictions</h1>
        <p>Select a prediction type below and provide your health information for personalized risk assessment.</p>
      </div>
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'diabetes' ? 'active' : ''}`} onClick={() => setActiveTab('diabetes')}>Diabetes Risk</button>
        <button className={`tab-btn ${activeTab === 'heart' ? 'active' : ''}`} onClick={() => setActiveTab('heart')}>Heart Disease Risk</button>
        <button className={`tab-btn ${activeTab === 'hypertension' ? 'active' : ''}`} onClick={() => setActiveTab('hypertension')}>Hypertension Risk</button>
      </div>
      <div className="form-container">{renderForm()}</div>
      
      {(result || apiError) && (
        <Modal isOpen={isResultModalOpen} onRequestClose={handleCloseModal} className="auth-modal" overlayClassName="auth-overlay">
          <h2>Prediction Result</h2>
          {apiError ? (
            <p className="error-message">{apiError}</p>
          ) : (
            <div className="result-content">
              <p><strong>Outcome:</strong> 
                <span className={`risk-tag ${result.prediction === 1 ? 'high' : 'low'}`}>
                  {result.prediction === 1 ? 'High Risk' : 'Low Risk'}
                </span>
              </p>
              <p><strong>Probability:</strong> {(result.probability * 100).toFixed(2)}%</p>
            </div>
          )}
          <button onClick={handleCloseModal} className="btn btn-primary">Close</button>
        </Modal>
      )}
    </div>
  );
};

export default PredictionsPage;