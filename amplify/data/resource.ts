import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// Create our About Table
const aboutTable = a.schema({
  AboutInfo: a.model({
      sprintNo: a.integer(),
      releaseDate: a.string(),
      teamName: a.string(),
      productName: a.string(),
      desc: a.string()
    })
    .authorization(allow => [allow.publicApiKey()])
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof aboutTable>;

// defines the data resource to be deployed
export const data = defineData({
  schema: aboutTable,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});