import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext.js';
import ReminderProvider from './reminder/ReminderProvider.jsx';
import App from './App.jsx';
import './index.css';

function Root() {
  return (
    <AppProvider>
      <ReminderProvider>
        <App />
      </ReminderProvider>
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
