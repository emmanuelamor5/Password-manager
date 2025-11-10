import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import AddPasswordForm from './components/AddPasswordForm';
import PasswordList from './components/PasswordList';
import './styles/main.css';

function App() {
  const [keychain, setKeychain] = useState(null);

  return (
    <div className="App">
      <h1>🔐 Secure Password Manager</h1>
      {!keychain ? (
        <LoginForm onLoginSuccess={setKeychain} />
      ) : (
        <div>
          <AddPasswordForm keychain={keychain} />
          <PasswordList keychain={keychain} />
        </div>
      )}
    </div>
  );
}

export default App;