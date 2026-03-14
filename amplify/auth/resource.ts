import { defineAuth } from '@aws-amplify/backend';

 
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      callbackUrls: [
        'http://localhost:5173/callback',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/callback',
        'https://amplifyDeployFix.d2jawpaet8g6c9.amplifyapp.com/callback',
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/',
        'https://amplifyDeployFix.d2jawpaet8g6c9.amplifyapp.com/',
      ],
    },
  },
  userAttributes: {
    email: {
      required: false,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
    preferredUsername: {
      required: false,
      mutable: true,
    },
  },
  groups: ["Admin", "Sponsor", "Driver"],
});
