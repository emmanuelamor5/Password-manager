# Secure Password Manager

This project is a secure password manager implemented in JavaScript, utilizing AES-GCM encryption, HMAC for domain privacy, and PBKDF2 for key derivation. The user interface is built with React, providing a user-friendly way to manage passwords securely.

## Features

- **Secure Storage**: Passwords are stored securely using AES-GCM encryption.
- **User Authentication**: Users can log in with a master password to access their passwords.
- **Add/Update Passwords**: Users can easily add or update domain-password pairs.
- **View Passwords**: Users can view their stored passwords in a list format.
- **Responsive Design**: The application is designed to be responsive and user-friendly.

## Project Structure

```
password-manager-ui
├── src
│   ├── components
│   │   ├── PasswordList.jsx
│   │   ├── AddPasswordForm.jsx
│   │   └── LoginForm.jsx
│   ├── App.jsx
│   ├── index.js
│   └── styles
│       └── main.css
├── public
│   └── index.html
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd password-manager-ui
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to access the application.


Step‑by‑step overview — how the app and Keychain are supposed to work

Login / create
User submits a master password in LoginForm.
App checks localStorage for a saved keychain JSON.
If none: Keychain.init(password) creates a new keychain, derives keys, returns an empty keychain; App dumps and saves it.
If present: Keychain.load(password, representation) parses JSON, derives keys from stored salt and the provided master password, verifies a sample ciphertext to ensure the password is correct.
Key derivation (Keychain._deriveKeys)
PBKDF2 with the master password + salt -> deriveBits.
Use a short HMAC on constants to derive two subkeys:
HMAC key (for domain privacy)
AES-GCM key (for encrypting passwords and labels)
Storing a password (Keychain.set)
Compute domainMac = HMAC(domain) using the hmacKey.
Encrypt the password with AES‑GCM:
iv, additionalData = stringToBuffer(domainMac), encrypt padded password -> ciphertext.
Encrypt a domain label (plaintext domain) with AES‑GCM using a different IV so the UI can show readable domains.
Store the entry under this domainMac in the in‑memory kvs with iv, ciphertext, labelIv, labelCiphertext.
Listing entries (Keychain.list)
Iterate kvs keys (domain MACs).
For each entry, try to decrypt labelCiphertext with labelIv and additionalData=domainMac to recover the human domain string; on failure show a truncated MAC fallback.
Return an array [{domain, mac}, ...] for the UI.
Retrieving a password (Keychain.get)
For a given plaintext domain, compute domainMac, locate entry, AES‑GCM decrypt ciphertext using iv and additionalData=domainMac, then trim padding and return plaintext password.
Removing an entry (Keychain.remove)
Compute domainMac from the plaintext domain and delete this.kvs[domainMac].
Persisting (Keychain.dump)
Serialize kvs + salt + checksum (SHA-256 of kvs JSON).
App stores that JSON in localStorage after set/remove so next session can be loaded.
UI flow (App + components)

App.handleLogin: loads or creates Keychain, calls keychain.list() and sets entries state.
AddPassword component calls App.handleAdd -> keychain.set(domain,password), dump to localStorage, refresh list.
PasswordList displays entries[].domain and delete buttons call App.handleRemove(domain) -> keychain.remove(domain), dump, refresh list.
## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.