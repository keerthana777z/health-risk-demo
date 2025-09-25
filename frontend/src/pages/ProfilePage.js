import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CSVUploader from '../components/CSVUploader';
import DashboardCharts from '../components/DashboardCharts'; // Import the new chart component
import './ProfilePage.css';

const ProfilePage = ({ session }) => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [healthData, setHealthData] = useState([]); // New state for CSV data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllData = async () => {
      if (!session) return;
      setLoading(true);

      // Fetch data from both tables at the same time
      const [predictionRes, healthDataRes] = await Promise.all([
        supabase
          .from('predictions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('health_data')
          .select('*')
          .eq('user_id', session.user.id)
          .order('recorded_at', { ascending: false })
      ]);

      if (predictionRes.error) {
        console.error('Error fetching prediction history:', predictionRes.error);
      } else {
        setPredictionHistory(predictionRes.data);
      }

      if (healthDataRes.error) {
        console.error('Error fetching health data:', healthDataRes.error);
      } else {
        setHealthData(healthDataRes.data);
      }

      setLoading(false);
    };

    getAllData();
  }, [session]);

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
          
          {/* Render the new charts if data exists */}
          {(predictionHistory.length > 0 || healthData.length > 0) && (
             <div className="card">
                <DashboardCharts predictionData={predictionHistory} healthData={healthData} />
             </div>
          )}

          <CSVUploader user={session.user} />

          <div className="card recent-assessments">
            <h3>Your Recent Assessments</h3>
            {loading ? (
              <p>Loading history...</p>
            ) : predictionHistory.length > 0 ? (
              <ul>
                {predictionHistory.map((item) => (
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