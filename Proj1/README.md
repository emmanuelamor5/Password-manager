# Secure Password Manager — Project README

Quick overview
- This repo contains:
  - A small React UI (`password-manager-ui`) for creating / using a local encrypted keychain.
  - A Keychain implementation (src/password-manager.js) that uses Web Crypto (PBKDF2, HMAC, AES‑GCM).
  - Unit tests (Mocha) that validate functionality and security properties.

1) UI — how it works (what to click / expect)
- Start the UI:
  - Open a terminal and run:
    - cd Proj1\password-manager-ui
    - npm install
    - npm start
  - Open http://localhost:3000
- Flow:
  - Login / Create: enter a master password. If no vault exists, a new encrypted vault is created.
  - Add Password: enter a domain (e.g. example.com) and a password -> Save.
  - Stored Passwords: the UI lists readable domain labels (decrypted labels). For safety the UI does not display plaintext passwords by default — delete is available.
- Notes:
  - The UI relies on the browser Web Crypto API (globalThis.crypto.subtle). Run the UI in a modern browser.

2) Tests — how to run and what they check
- From the project root (Proj1):
  - npm test
- Tests are written with Mocha and cover:
  - Initialization, set/get/remove semantics
  - Serialization (dump/load) and checksum-based rollback detection
  - Security assertions ensuring domain names and passwords are not stored in clear text
- Example:
  - You should see `12 passing` for the provided test suite.

3) Inspecting the encrypted data (DevTools / Console)
- The application persists the vault to localStorage under the key `keychain`.
  - Open DevTools → Application (Chrome) → Local Storage → http://localhost:3000 → `keychain`.
  - The value is a JSON string: `{ "kvs": { "<domainMac>": { iv, ciphertext, labelIv, labelCiphertext } }, "salt": "...", "checksum": "..." }`
- Example entry (formatted):
  {
    "kvs": {
      "QmFzZTY0U01BQ0hhc2g=": {
        "iv": "Base64IV==",
        "ciphertext": "Base64Cipher==",
        "labelIv": "Base64IV==",
        "labelCiphertext": "Base64LabelCipher=="
      }
    },
    "salt": "Base64Salt==",
    "checksum": "Base64Checksum=="
  }
- Important:
  - All ciphertexts and IVs are Base64 strings. Domains are stored as HMAC outputs (not plaintext).
  - You cannot directly read passwords from localStorage — they are encrypted with the key derived from your master password.

4) Decrypting entries manually (advanced)
- If you want to decrypt an entry manually in the browser console:
  - Ensure the UI code (Keychain class and lib.js) is available on the same origin (it is when running the dev server).
  - Option: use the UI to re-construct a Keychain instance with your master password and then call its methods:
    - Pseudocode (run in DevTools Console after app is loaded and the module is accessible):
      (async () => {
        const repr = localStorage.getItem('keychain');
        // create keychain: Keychain.load(masterPassword, repr)
        // then call kc.list() or kc.get('example.com')
      })();
  - If you prefer a script: copy the `keychain` JSON and use a small Node/browser script that imports Keychain and calls load() with your master password (Web Crypto availability required).

5) Troubleshooting
- "Missing script: start" — run `npm start` inside `password-manager-ui` folder (not project root).
- Web Crypto errors: ensure you use a modern browser (Chrome / Firefox / Edge). Node-only contexts will not work without polyfills/shims.
- Test issues: run `npm test` from the project root (Proj1). If Mocha says "No test files found", ensure you run it from the root (Mocha path is configured to `./test --recursive`).

6) Presentation / demo tips
- Show the React UI login, add one entry, then open DevTools → Application → Local Storage and show the `keychain` JSON (explain fields).
- Run `npm test` in the terminal and show passing tests.
- Demonstrate that the UI lists readable domains (encrypted label decrypted by Keychain), while the raw localStorage contains only ciphertexts and Base64 IVs.

Contact / Next steps
- If you want the UI to safely reveal a password on demand, I can add a secure "Show" button that prompts for re-entering the master password and then calls `Keychain.get(domain)` and displays the result briefly.
- I can also add a small debug endpoint to expose the current Keychain instance to the console in development builds for easy inspection.

