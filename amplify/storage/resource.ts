import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'profilePictures',
  access: (allow) => ({
    'profile-pictures/*': [
      allow.groups(['Admin', 'Driver', 'Sponsor']).to(['read', 'write', 'delete']),
    ],
  }),
});