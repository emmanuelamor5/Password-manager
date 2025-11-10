import React from "react";

export default function PasswordList({ entries, onRemove }) {
  return (
    <div className="password-list">
      <h2>Stored Passwords</h2>
      {entries.length === 0 ? (
        <p>No passwords stored yet.</p>
      ) : (
        <ul>
          {entries.map((e, i) => (
            <li key={i}>
              <span>{e.domain}</span>
              <button onClick={() => onRemove(e.domain)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
