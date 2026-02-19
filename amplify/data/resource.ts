import { a, defineData, type ClientSchema} from '@aws-amplify/backend';

// Create our About Table
const AboutSchema = a.schema({
  AboutInfo: a.model({
      sprintNo: a.id().required(),
      releaseDate: a.string(),
      teamName: a.string(),
      productName: a.string(),
      desc: a.string()
    }).identifier(['sprintNo'])
    .authorization(allow => [allow.publicApiKey()])
});

// Used for code completion / highlighting when making requests from frontend
export type AboutSchema = ClientSchema<typeof AboutSchema>;

// defines the data resource to be deployed
export const data = defineData({
  schema: AboutSchema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});
