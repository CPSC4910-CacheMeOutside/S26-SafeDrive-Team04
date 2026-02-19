import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const aboutSchema = a.schema({
  // 1. Define your return type as a custom type
  EchoResponse: a.customType({
    content: a.string(),
    executionDuration: a.float()
  }),

  // 2. Define your query with the return type and, optionally, arguments
  echo: a
    .query()
    // arguments that this query accepts
    .arguments({
      content: a.string()
    })
    // return type of the query
    .returns(a.ref('EchoResponse'))
    // only allow signed-in users to call this API
    .authorization(allow => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof aboutSchema>;

export const data = defineData({
  schema: aboutSchema
});