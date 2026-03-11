import { defineAuth } from '@aws-amplify/backend';

 
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      callbackUrls: [
        'http://localhost:5173/callback',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/callback',
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/',
      ],
    },
  },
  userAttributes: {
    fullname: {
      required: true,
      mutable: false,
    },
    phoneNumber: {
      required: true,
      mutable: true,
    },
    preferredUsername: {
      required: true,
      mutable: true,
    },
  },
  groups: ["Admin", "Sponsor", "Driver"],
});
