// src/components/AuthModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { supabase } from '../supabaseClient';
import './AuthModal.css';

// Binds the modal to your app element for accessibility
Modal.setAppElement('#root');

const AuthModal = ({ isOpen, onRequestClose, view: initialView }) => {
  const [view, setView] = useState(initialView); // 'sign_in' or 'sign_up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Switch between login and signup views
  useEffect(() => {
    setView(initialView);
    setError(null); // Clear errors when view changes
  }, [initialView, isOpen]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else onRequestClose(); // Close modal on success
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onRequestClose(); // Close modal on success
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="auth-modal"
      overlayClassName="auth-overlay"
    >
      {view === 'sign_in' ? (
        // Sign In Form
        <form onSubmit={handleSignIn}>
          <h2>Welcome Back</h2>
          <p>Sign in to access your profile and history.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="toggle-view">
            Don't have an account?{' '}
            <span onClick={() => setView('sign_up')}>Sign Up</span>
          </p>
        </form>
      ) : (
        // Sign Up Form
        <form onSubmit={handleSignUp}>
          <h2>Create Account</h2>
          <p>Get started with your personalized health predictions.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <p className="toggle-view">
            Already have an account?{' '}
            <span onClick={() => setView('sign_in')}>Sign In</span>
          </p>
        </form>
      )}
    </Modal>
  );
};

export default AuthModal;