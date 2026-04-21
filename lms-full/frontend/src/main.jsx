// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './assets/styles/global.css';
import './assets/styles/sidebar.css';
import './assets/styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.875rem' }, success: { iconTheme: { primary: '#10b981', secondary: '#fff' } } }} />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
