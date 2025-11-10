import React, { useState } from 'react';
import { Keychain } from '../password-manager';

const LoginForm = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const keychain = await Keychain.init(password);
      onLoginSuccess(keychain);
    } catch (err) {
      setError('Failed to initialize keychain');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Initialize Keychain</h2>
      <input
        type="password"
        placeholder="Enter master password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Initialize</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default LoginForm;