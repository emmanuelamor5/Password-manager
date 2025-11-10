import React, { useEffect, useState } from 'react';

const PasswordList = ({ keychain }) => {
  const [passwords, setPasswords] = useState([]);

  useEffect(() => {
    const fetchPasswords = async () => {
      if (!keychain || !keychain.kvs) return;
      
      const keys = Object.keys(keychain.kvs);
      const passwordEntries = await Promise.all(
        keys.map(async (key) => {
          const password = await keychain.get(key);
          return { domain: key, password };
        })
      );
      setPasswords(passwordEntries);
    };

    fetchPasswords();
  }, [keychain]);

  return (
    <div className="password-list">
      <h2>Stored Passwords</h2>
      {passwords.length === 0 ? (
        <p>No passwords stored yet.</p>
      ) : (
        <ul>
          {passwords.map((entry, index) => (
            <li key={index}>
              <strong>{entry.domain}</strong>: {entry.password}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordList;