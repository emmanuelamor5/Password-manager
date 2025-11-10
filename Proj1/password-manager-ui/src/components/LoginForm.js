import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [password, setPassword] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!password) return;
    onLogin(password);
    setPassword("");
  };
  return (
    <form onSubmit={submit} className="login-form">
      <div>
        <label>Master Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Login / Create</button>
    </form>
  );
}
