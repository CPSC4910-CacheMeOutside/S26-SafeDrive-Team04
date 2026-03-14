import { defineFunction } from '@aws-amplify/backend';

export const adminTakeover = defineFunction({
  name: 'admin-takeover',
  entry: './handler.ts',
  resourceGroupName: 'auth',
});