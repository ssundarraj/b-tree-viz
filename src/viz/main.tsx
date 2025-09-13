import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Handle GitHub Pages 404 redirect
const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;
if (redirect && redirect !== location.href) {
  history.replaceState(null, null as any, redirect);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);