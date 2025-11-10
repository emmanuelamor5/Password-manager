import React, { useState } from 'react';

const AddPasswordForm = ({ keychain }) => {
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await keychain.set(domain, password);
      setMessage('✓ Password saved!');
      setDomain('');
      setPassword('');
    } catch (err) {
      setMessage('Error saving password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-password-form">
      <h2>Add New Password</h2>
      <input
        type="text"
        placeholder="Domain (e.g., www.example.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Save Password</button>
      {message && <p className="success">{message}</p>}
    </form>
  );
};

export default AddPasswordForm;