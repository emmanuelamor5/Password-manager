import React, { useState } from "react";

export default function AddPassword({ onAdd }) {
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!domain || !password) return;
    onAdd(domain, password);
    setDomain("");
    setPassword("");
  };
  return (
    <form onSubmit={submit} className="add-password-form">
      <h2>Add Password</h2>
      <div>
        <label>Domain</label>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Add</button>
    </form>
  );
}
