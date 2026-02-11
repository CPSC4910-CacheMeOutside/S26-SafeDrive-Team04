import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from 'react-oidc-context';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

const isLocalHost = window.location.origin.includes("localhost");

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_7kWyOumWk",
  client_id: "5qkcg4h6o51nq40der98l7qsvk",
  redirect_uri: isLocalHost
    ? "http://localhost:3000/"
    : "https://main.d2jawpaet8g6c9.amplifyapp.com",
  post_logout_redirect_uri: isLocalHost
    ? "http://localhost:3000/"
    : "https://main.d2jawpaet8g6c9.amplifyapp.com",
  response_type: "code",
  scope: "phone openid email",
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
