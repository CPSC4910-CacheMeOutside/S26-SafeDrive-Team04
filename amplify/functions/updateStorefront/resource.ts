import { defineFunction } from '@aws-amplify/backend';

export const sayHello = defineFunction({
  name: 'update-storefront',
  entry: './handler.ts',
  // Update products on storefront every 30 minutes
  schedule: "* 30 * * * * *"
});