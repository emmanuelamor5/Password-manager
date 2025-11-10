import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import AddPassword from "./components/AddPassword";
import PasswordList from "./components/PasswordList";
import { Keychain } from "./password-manager";
import "./App.css";

export default function App() {
  const [keychain, setKeychain] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [entries, setEntries] = useState([]);

  const handleLogin = async (masterPassword) => {
    try {
      const stored = localStorage.getItem("keychain");
      let kc;
      if (stored) {
        kc = await Keychain.load(masterPassword, stored);
      } else {
        kc = await Keychain.init(masterPassword);
        const [repr] = await kc.dump();
        localStorage.setItem("keychain", repr);
      }
      setKeychain(kc);
      setIsLoggedIn(true);
      const list = await kc.list();
      setEntries(list);
    } catch (err) {
      alert("Login failed: " + err);
    }
  };

  const handleAdd = async (domain, password) => {
    if (!keychain) return;
    await keychain.set(domain, password);
    const [repr] = await keychain.dump();
    localStorage.setItem("keychain", repr);
    const list = await keychain.list();
    setEntries(list);
  };

  const handleRemove = async (domain) => {
    if (!keychain) return;
    await keychain.remove(domain);
    const [repr] = await keychain.dump();
    localStorage.setItem("keychain", repr);
    const list = await keychain.list();
    setEntries(list);
  };

  return (
    <div className="App">
      <h1>Secure Password Manager</h1>
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <div className="container">
          <AddPassword onAdd={handleAdd} />
          <PasswordList entries={entries} onRemove={handleRemove} />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => { setIsLoggedIn(false); setKeychain(null); setEntries([]); }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
