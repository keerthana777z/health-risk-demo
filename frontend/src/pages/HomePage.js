// src/pages/HomePage.js
import React from 'react';
import './HomePage.css'; // We will create this file next

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Predict Health Risks with AI Precision</h1>
          <p>
            Advanced machine learning algorithms analyze your health data to predict
            and prevent chronic diseases before they happen.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Risk Assessment →</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Comprehensive Health Analysis</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Heart Disease Prediction</h3>
            <p>Advanced analysis of cardiovascular risk factors including cholesterol, blood pressure, and lifestyle indicators.</p>
          </div>
          <div className="feature-card">
            <h3>Diabetes Assessment</h3>
            <p>Comprehensive evaluation using BMI, glucose levels, insulin, and family history data.</p>
          </div>
          <div className="feature-card">
            <h3>Hypertension Analysis</h3>
            <p>Blood pressure monitoring with lifestyle factors to predict hypertension risk.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;