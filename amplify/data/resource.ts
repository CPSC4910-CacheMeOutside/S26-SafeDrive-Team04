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
 
 
  Admin: a.model({
    adminId: a.id().required(),
    name: a.string().required(),
    email: a.string().required(),
 
    messages: a.hasMany('AdminMessage', 'adminId'),
  }).identifier(['adminId'])
  .authorization(allow => [
    allow.groups(['Admin'])
  ]),
 
AdminMessage: a.model({
  messageId: a.id().required(),
 
  driverId: a.id().required(),
  adminId: a.id(),
 
  subject: a.string(),
  message: a.string(),
  status: a.string(),
  createdAt: a.datetime(),
 
  admin: a.belongsTo('Admin', 'adminId')
}).identifier(['messageId'])
.authorization(allow => [
  allow.groups(['Admin']),
  allow.groups(['Driver'])
]),
 
 
  Sponsor: a.model({
    sponsorId: a.id().required(),
    name: a.string().required(),
    email: a.string(),
    company: a.string(),
 
 
    drivers: a.hasMany('Driver', 'sponsorId'),
    transacitons: a.hasMany('SponsorTransaction', 'sponsorId')
  })
  .identifier(['sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),
 
 
 
 
 
 
  Driver: a.model({
    driverId: a.id().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    email: a.string(),
    phone: a.string(),
    DL: a.string(),
    points: a.integer().default(0),
    status: a.string(),
 
    transactions: a.hasMany('SponsorTransaction', 'driverId'),
    pointLogs: a.hasMany('DriverPointsLog', 'driverId'),
    notificationsEnabled: a.boolean().default(true),
 
 
 
    sponsorId: a.id(),
    sponsor: a.belongsTo('Sponsor', 'sponsorId')
  })
  .identifier(['driverId'])
  .authorization(allow => [
    allow.groups(['Admin']),
    allow.groups(['Sponsor']),
    allow.groups(['Driver'])
  ]),
 
 
 
  SponsorTransaction: a.model({
    transactionId: a.id().required(),
    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsor', 'sponsorId'),
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId'),
   
    amount: a.integer().required(),
    type: a.string().required(),
    reason: a.string(),
    note: a.string(),
    receiptUrl: a.string(),
    balanceAfter: a.integer(),
  })
  .identifier(['transactionId'])
  .authorization(allow => [allow.publicApiKey()]),
 
 
 
  DriverPointsLog: a.model({
    logId: a.id().required(),
    driverId: a.id().required(),
    changeAmount: a.integer().required(),
    reason: a.string(),
    createdBy: a.string(),
    driver: a.belongsTo('Driver', 'driverId')
  })
  .identifier(['logId'])
  .authorization(allow => [allow.publicApiKey()]),
 
 
 
  DrivingGuidance: a.model({
    guidanceId: a.id().required(),
 
    sponsorId: a.id(),
 
    title: a.string(),
    content: a.string(),
 
    createdAt: a.datetime(),
 
   
 
  })
  .identifier(['guidanceId'])
  .authorization(allow => [
    allow.groups(['Sponsor']),
    allow.groups(['Driver']),
    allow.groups(['Admin'])
  ]),
 
 
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