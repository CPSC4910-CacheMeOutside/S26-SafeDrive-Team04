import { defineAuth } from '@aws-amplify/backend';
import { adminUsersFunction } from '../functions/adminManagementFeat/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      callbackUrls: [
        'http://localhost:5173/callback',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/callback',
        'https://amplifydeployfix.d2jawpaet8g6c9.amplifyapp.com/callback',
        'https://main.d2jawpaet8g6c9.amplifyapp.com/callback',
        'https://newusers.d2jawpaet8g6c9.amplifyapp.com/callback',
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://dev.d2jawpaet8g6c9.amplifyapp.com/',
        'https://amplifydeployfix.d2jawpaet8g6c9.amplifyapp.com/',
        'https://main.d2jawpaet8g6c9.amplifyapp.com/',
        'https://newusers.d2jawpaet8g6c9.amplifyapp.com/',
      ],
    },
  },
  userAttributes: {
    fullname: { required: true, mutable: true },
    phoneNumber: { required: true, mutable: true },
  },
  groups: ['Admin', 'Sponsor', 'Driver'],
  access: (allow) => [
    allow.resource(adminUsersFunction).to([
      'listUsers',
      'getUser',
      'updateUserAttributes',
      'listGroupsForUser',
      'addUserToGroup',
      'removeUserFromGroup',
    ]),
  ],
});