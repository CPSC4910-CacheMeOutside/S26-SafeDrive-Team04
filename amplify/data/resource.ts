import { a, defineData, type ClientSchema} from '@aws-amplify/backend';

// Create our About Table
const SafeDriveSchema = a.schema({
  AboutInfo: a.model({
    sprintNo: a.id().required(),
    releaseDate: a.string(),
    teamName: a.string(),
    productName: a.string(),
    desc: a.string()
  }).identifier(['sprintNo'])
  .authorization(allow => [allow.publicApiKey()]),

  Product: a.model({
    pId: a.id().required(),
    title: a.string(),
    imgs: a.json(),
    synop: a.string(),
    catagory: a.string(),
    price: a.float(),
    available: a.boolean(),
    catalog: a.belongsTo('SponsorCatalog', 'pId'),
  }).identifier(['pId'])
  .authorization(allow => [allow.publicApiKey()]),

  SponsorCatalog: a.model({
    userId: a.id().required(),
    products: a.hasMany('Product', 'pId')
  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

});

// Used for code completion / highlighting when making requests from frontend
export type AboutSchema = ClientSchema<typeof SafeDriveSchema>;

// defines the data resource to be deployed
export const data = defineData({
schema: SafeDriveSchema,
authorizationModes: {
defaultAuthorizationMode: 'apiKey',
apiKeyAuthorizationMode: { expiresInDays: 30 }
}
});
