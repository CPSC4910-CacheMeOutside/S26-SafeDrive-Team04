import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//import { AuthProvider } from 'react-oidc-context';
//import reportWebVitals from './reportWebVitals';

/*const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_7kWyOumWk",
  client_id: "5qkcg4h6o51nq40der98l7qsvk",
  redirect_uri: "https://main.d34ak230g49yud.amplifyapp.com/",
  response_type: "code",
  scope: "phone openid email",
};
*/
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App />
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
