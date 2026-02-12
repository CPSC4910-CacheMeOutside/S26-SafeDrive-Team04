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
    : "https://sponsor-profile-page.d2jawpaet8g6c9.amplifyapp.com/",
  post_logout_redirect_uri: isLocalHost
    ? "http://localhost:3000/"
    : "https://sponsor-profile-page.d2jawpaet8g6c9.amplifyapp.com/",
  response_type: "code",
  scope: "openid profile email phone aws.cognito.signin.user.admin",
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>

      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/about" element={<AboutPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/admin" element={<AdminPage />}/>
        <Route path="/create_password" element={<CreatePassword />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/logout" element={<LogoutPage />}/>
        <Route path="/SponsorPage" element={<SponsorPage />}/>
        <Route path="/catalog" element={<Catalog />}/>
        <Route path="/edit_profile" element={<EditProfilePage />}/>
        <Route path="/sponsor_viewDrivers" element={<Sponsor_ViewDrivers />}/>
        <Route path="/catalog" element={<Catalog />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
