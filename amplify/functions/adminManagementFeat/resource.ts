import { defineFunction } from '@aws-amplify/backend';

export const adminTakeover = defineFunction({
  name: 'admin-takeover',
  entry: './handler.ts',
  resourceGroupName: 'auth',
});

export const updateDriver = defineFunction({
  name: 'updateDriver',
  entry: './handler.ts',
  environment: {
    USER_POOL_ID: 'us-east-1_ef9pmhpQq',
  },
});