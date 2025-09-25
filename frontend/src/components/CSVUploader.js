// src/components/CSVUploader.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';

const CSVUploader = ({ user }) => {
  const [message, setMessage] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Prepare data for Supabase
        const dataToInsert = results.data.map(row => ({
          user_id: user.id,
          recorded_at: row.date,
          wbc: parseFloat(row.wbc),
          rbc: parseFloat(row.rbc),
          hgb: parseFloat(row.hgb),
          hct: parseFloat(row.hct),
          plt: parseFloat(row.plt),
        }));

        // Insert data into Supabase
        const { error } = await supabase.from('health_data').insert(dataToInsert);

        if (error) {
          setMessage(`Error: ${error.message}`);
          console.error(error);
        } else {
          setMessage(`${results.data.length} records successfully uploaded!`);
        }
      },
      error: (error) => {
        setMessage(`Error parsing CSV: ${error.message}`);
        console.error(error);
      }
    });
  };

  return (
    <div className="card csv-uploader">
      <h3>Upload Health Data</h3>
      <p>Upload a CSV file with your historical health records. The file must contain the headers: 'date', 'wbc', 'rbc', 'hgb', 'hct', 'plt'.</p>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default CSVUploader;