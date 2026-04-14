import { defineFunction } from '@aws-amplify/backend';

export const updateStorefront = defineFunction({
  name: 'update-storefront',
  entry: './handler.ts',
  // Update products on storefront every 30 minutes
  schedule: "every 1m",
  resourceGroupName: 'data'
});