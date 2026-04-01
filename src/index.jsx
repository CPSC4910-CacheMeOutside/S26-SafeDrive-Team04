import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import  NotificationProvider from './NotificationContext';
import ConversionRatioProvider from './ConversionRatioContext';
import PointsProvider from './PointsContext';
import { FontSizeProvider } from './FontSizeContext';
import { LanguageProvider } from './LanguageContext';

/* Add the backend */
import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from 'aws-amplify/utils';
import 'aws-amplify/auth/enable-oauth-listener';
import outputs from '../amplify_outputs.json';

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: outputs.custom?.API ?? {},
  },
});
 
const root = ReactDOM.createRoot(document.getElementById('root'));
 
root.render(
  <React.StrictMode>
    <BrowserRouter>
        {/* makes the notification additions available throughout the entire app */}
        <FontSizeProvider>
          <LanguageProvider>
          <NotificationProvider>
            <ConversionRatioProvider>
              <PointsProvider>
                <App />
              </PointsProvider>
            </ConversionRatioProvider>
          </NotificationProvider>
          </LanguageProvider>
        </FontSizeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
 

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
