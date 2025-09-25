import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ProfilePage.css';

const ProfilePage = ({ session }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRisk, setAverageRisk] = useState(0);

  // This useEffect fetches the user's personal prediction history
  useEffect(() => {
    const getHistory = async () => {
      if (!session) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
      } else {
        setHistory(data);
      }
      setLoading(false);
    };

    getHistory();
  }, [session]);

  // This useEffect fetches the platform-wide average from our new backend endpoint
  useEffect(() => {
    const getAnalytics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/analytics/average_probability');
        const data = await response.json();
        if (data.average_probability) {
          setAverageRisk(data.average_probability);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    
    getAnalytics();
  }, []); // The empty array means this runs only once when the page loads

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Your Health Profile</h1>
        <p>Manage your health information and view assessment history.</p>
      </div>
      <div className="profile-content">
        <aside className="user-info-card">
          <div className="user-avatar">👤</div>
          <h2>{session.user.email}</h2>
          <p className="user-role">Health Assessment Member</p>
        </aside>
        <main className="main-content">
          
          {/* NEW ANALYTICS CARD */}
          <div className="card analytics-card">
            <h3>Platform Analytics</h3>
            <div className="analytics-item">
              <span>Average Risk Probability (All Users)</span>
              <span className="analytics-value">{(averageRisk * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="card recent-assessments">
            <h3>Your Recent Assessments</h3>
            {loading ? (
              <p>Loading history...</p>
            ) : history.length > 0 ? (
              <ul>
                {history.map((item) => (
                  <li key={item.id}>
                    <span>{item.model_name.charAt(0).toUpperCase() + item.model_name.slice(1)} Risk</span>
                    <span className={`risk-tag ${item.prediction === 1 ? 'high' : 'low'}`}>
                      {item.prediction === 1 ? 'High Risk' : 'Low Risk'}
                    </span>
                    <span className="risk-percent">{(item.probability * 100).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No assessment history found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
 export default ProfilePage;