import { defineFunction } from '@aws-amplify/backend';

export const adminUsersFunction = defineFunction({
  name: 'admin-users-function',
  entry: './handler.ts',
  resourceGroupName: 'auth'
});