import { a, defineData, type ClientSchema} from '@aws-amplify/backend';
import { identifyUser } from 'aws-amplify/analytics';

// Create our About Table
const SafeDriveSchema = a.schema({

  AppControl: a.model({
    appCId: a.id().required(),
    sprintNo: a.id()
  }).identifier(['appCId'])
  .authorization(allow => [allow.publicApiKey()]),

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

  Orders: a.model({
    oId: a.id().required(),
    stat: a.integer().required(),
    notes: a.string().required(),

    products: a.hasMany('Product', "oId")
  }).authorization(allow => [allow.publicApiKey()]),

  Product: a.model({
    pId: a.id().required(),
    title: a.string(),
    imgs: a.json(),
    synop: a.string(),
    catagory: a.string(),
    price: a.float(),
    available: a.boolean(),

    wishId: a.id(),
    wishlist: a.belongsTo('Wishlist', 'wishId'),

    cartId: a.id(),
    cart: a.belongsTo('Cart', 'cartId'),

    oId: a.id(),
    order: a.belongsTo('Orders', 'oId')

  }).identifier(['pId'])
  .authorization(allow => [allow.publicApiKey()]),

  Wishlist: a.model({
    wishId: a.id().required(),

    userId: a.id().required(),
    user: a.belongsTo('Drivers', 'userId'),

    products: a.hasMany('Product', 'wishId')
  }).identifier(['wishId'])
  .authorization(allow => [allow.publicApiKey()]),

  Cart: a.model({
    cartId: a.id().required(),

    userId: a.id().required(),
    user: a.belongsTo('Drivers', 'userId'),

    products: a.hasMany('Product', 'cartId')

  }).identifier(['cartId'])
  .authorization(allow => [allow.publicApiKey()]),

  DriverApplications: a.model({
    appId: a.id().required(),
    stat: a.integer().required(),
    first: a.string().required(),
    last: a.string().required(),
    email: a.string().required(),
    phone: a.string(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string()
  }).identifier(['appId'])
  .authorization(allow => [allow.publicApiKey()]),

  Users: a.model({
    userID: a.id().required(),
    cogID: a.id().required(),
    first: a.string().required(),
    last: a.string().required(),
    email: a.string().required(),
    phone: a.string()
  }).identifier(['userID'])
  .authorization(allow => [allow.publicApiKey()]),

  Drivers: a.model({
    userId: a.id().required(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),

    wishlist: a.hasOne('Wishlist', 'userId'),
    cart: a.hasOne('Cart', 'userId'),
    ptAccounts: a.hasMany('PTAccounts', 'driverId')

  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

  PTAccounts: a.model({
    
    driverId: a.id().required(),
    driver: a.belongsTo('Drivers', 'driverId'),

    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsors', 'sponsorId'),

    balance: a.integer()
  }).identifier(['driverId', 'sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),

  Sponsors: a.model({
    userId: a.id().required(),
    affiliation: a.string(),

    conversion: a.integer(),
    ptAccounts: a.hasMany('PTAccounts', 'sponsorId')

  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

  Admins: a.model({
    userId: a.id().required()
  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

});







// Used for code completion / highlighting when making requests from frontend
export type AppSchema = ClientSchema<typeof SafeDriveSchema>;

// defines the data resource to be deployed
export const data = defineData({
schema: SafeDriveSchema,
authorizationModes: {
defaultAuthorizationMode: 'apiKey',
apiKeyAuthorizationMode: { expiresInDays: 30 }
}
});
