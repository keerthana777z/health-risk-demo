import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import PredictionsPage from './pages/PredictionsPage';
import ProfilePage from './pages/ProfilePage';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authView, setAuthView] = useState('sign_in');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenModal = (view) => {
    setAuthView(view);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Router>
      <Navbar session={session} onLoginClick={() => handleOpenModal('sign_in')} onSignUpClick={() => handleOpenModal('sign_up')} />
      <AuthModal isOpen={isModalOpen} onRequestClose={handleCloseModal} view={authView} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/predictions" element={<PredictionsPage session={session} />} />
        <Route path="/profile" element={session ? <ProfilePage session={session} /> : <HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;