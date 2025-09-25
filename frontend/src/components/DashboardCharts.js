// src/components/DashboardCharts.js
import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#D92D20', '#12B76A']; // Red for High Risk, Green for Low Risk

const DashboardCharts = ({ predictionData, healthData }) => {
  // Prepare data for the pie chart
  const riskCounts = predictionData.reduce((acc, curr) => {
    const risk = curr.prediction === 1 ? 'High Risk' : 'Low Risk';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(riskCounts).map(key => ({ name: key, value: riskCounts[key] }));

  // Prepare and sort data for the line chart
  const lineChartData = healthData
    .map(d => ({ date: new Date(d.recorded_at).toLocaleDateString(), hgb: d.hgb }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="dashboard-charts">
      <h3>Your Health Dashboard</h3>
      <div className="charts-container">
        <div className="chart">
          <h4>Prediction Summary</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name === 'High Risk' ? 0 : 1]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart">
          <h4>Hemoglobin (HGB) Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hgb" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;