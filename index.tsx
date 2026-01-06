
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { checkAndPerformReset } from './services/system.ts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Perform any pending system resets (DB wipes) before the React app mounts and locks the DB.
checkAndPerformReset().then(() => {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
});
