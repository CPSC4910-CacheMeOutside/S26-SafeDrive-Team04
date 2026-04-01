import { a, defineData, type ClientSchema} from '@aws-amplify/backend';
import { id } from 'aws-sdk/clients/datapipeline';
 
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

  // A user in the SafeDrive application
  User: a.model({
    userId: a.id(),
    // An id to the user's corrosponding entry in Cognito
    subId: a.id(),
    first: a.string(),
    last: a.string(),
    email: a.string(),
    phone: a.string()
  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),
 
  // A admin class user
  Admin: a.model({
    adminId: a.id().required(),
    userId: a.id()
  }).identifier(['adminId'])
  .authorization(allow => [
    allow.groups(['Admin'])
  ]),
 
  // A sponsor class user
  Sponsor: a.model({
    sponsorId: a.id().required(),
    userId: a.id(),
    affiliation: a.string(),

    drivers: a.hasMany("DriverSponsor", 'sponsorId'),
    applications: a.hasMany('Application', 'sponsorId'),
  })
  .identifier(['sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),

  // A model that assigns sponsors to drivers and vise versa 
  DriverSponsor: a.model({
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId'),
    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsor', 'sponsorId'),

    // The total number of points the sponsor has rewarded the driver
    points: a.integer()
  }).identifier(['driverId', 'sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),

  Application: a.model({
    appId: a.id().required(),
    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsor', 'sponsorId'),
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId'),
    status: a.integer(),
    first: a.string(),
    last: a.string(),
    email: a.string(),
    phone: a.string(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),
    notes: a.string(),

    logs: a.hasMany('ApplicationLog', 'appId'),
  }).identifier(['appId'])
  .authorization(allow => [allow.publicApiKey()]),

  ApplicationLog: a.model({
    logId: a.id().required(),
    date: a.string(),
    appId: a.id().required(),
    application: a.belongsTo('Application', 'appId'),
  }).identifier(['logId'])
  .authorization(allow => [allow.publicApiKey()]),
 
  // A driver class user
  Driver: a.model({
    driverId: a.id().required(),
    userId: a.id(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),

    // TODO: This attribute is being depriciated in favor of the new SponsorDriver schema 
    points: a.integer().default(0),

    sponsors: a.hasMany("DriverSponsor", "driverId"),
    wishlist: a.hasOne('Wishlist', 'driverId'),
    applications: a.hasMany('Application', 'driverId'),
  })
  .identifier(['driverId'])
  .authorization(allow => [
    allow.groups(['Admin']),
    allow.groups(['Sponsor']),
    allow.groups(['Driver'])
  ]),

  Wishlist: a.model({
    wishId: a.id().required(),
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId')
  }).identifier(['wishId'])
  .authorization(allow => [allow.publicApiKey()]),

  // TODO: Model is slated for deprication. Ensure all references are handled before removing
  SponsorTransaction: a.model({
    transactionId: a.id().required(),
    // TODO: Re-add relationship link to sponsor
    sponsorId: a.id().required(),
    // TODO: Re-add relationship link to driver
    driverId: a.id().required(),
    
    amount: a.integer().required(),
    type: a.string().required(),
    reason: a.string(),
    note: a.string(),
    receiptUrl: a.string(),
    balanceAfter: a.integer(),
  })
  .identifier(['transactionId'])
  .authorization(allow => [allow.publicApiKey()]), 

  WishlistProduct: a.model({
    wishId: a.id().required(),
    pId: a.id().required()
  }).identifier(['wishId', 'pId'])
  .authorization(allow => [allow.publicApiKey()]),
 
  // A product designed for 
  Product: a.model({
    pId: a.id().required(),
    title: a.string(),
    imgs: a.json(),
    synop: a.string(),
    catagory: a.string(),
    price: a.float(),
    available: a.boolean(),
  }).identifier(['pId'])
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