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
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../amplify_outputs.json';

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: outputs.custom?.API ?? {},
  },
},
{
  API: {
      REST: {
        headers: async () => {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          return token ? { Authorization: token } : {};
        },
      },
    },
  }
);

console.log("REST config:", outputs.custom?.API);
 
const root = ReactDOM.createRoot(document.getElementById('root'));

console.log(outputs);
 
root.render(
  <React.StrictMode>
    <BrowserRouter>
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
 
reportWebVitals();
