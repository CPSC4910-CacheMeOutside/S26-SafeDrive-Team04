import { a, defineData, type ClientSchema} from '@aws-amplify/backend';
import { identifyUser } from 'aws-amplify/analytics';

// Create our About Table
const SafeDriveSchema = a.schema({
  /* Used to store configs for website behavior. Should only be one of this schema type */
  AppControl: a.model({
    // Should always be 1. There should never be more than one of this schema type
    appCId: a.id().required(),
    // The number of the sprint whose info is displayed on the about page
    sprintNo: a.id()
  }).identifier(['appCId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* Holds data regarding our about page */
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
    /* The order's status represented by an integer. 
    0: pending
    1: approved
    2: denied
    */
    stat: a.integer().required(),
    // Description of status
    notes: a.string().required(),

    products: a.hasMany('Product', "oId")
  }).authorization(allow => [allow.publicApiKey()]),

  /* An item being sold in the store */
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

  /* A driver's list of wanted items */
  Wishlist: a.model({
    wishId: a.id().required(),

    userId: a.id().required(),
    user: a.belongsTo('Drivers', 'userId'),

    products: a.hasMany('Product', 'wishId')
  }).identifier(['wishId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* A driver's list of items queued for buying */
  Cart: a.model({
    cartId: a.id().required(),

    userId: a.id().required(),
    user: a.belongsTo('Drivers', 'userId'),

    products: a.hasMany('Product', 'cartId')

  }).identifier(['cartId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* An application submitted by a driver for a sponsor's incentive program */
  DriverApplications: a.model({
    appId: a.id().required(),
    /* The status of an application represented by a integer
    0: New/Pending
    1: Approved
    2: Denied */
    stat: a.integer().required(),
    first: a.string().required(),
    last: a.string().required(),
    email: a.string().required(),
    phone: a.string(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),
    notes: a.string()
  }).identifier(['appId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* A user of our system. A user has both this type of schema and either
  a driver, sponsor, or admin schema as well, both schemas having the same 
  user ID*/
  Users: a.model({
    userID: a.id().required(),
    cogID: a.id().required(),
    first: a.string().required(),
    last: a.string().required(),
    email: a.string().required(),
    phone: a.string()
  }).identifier(['userID'])
  .authorization(allow => [allow.publicApiKey()]),

  /* A user part of the Driver classification */
  Drivers: a.model({
    userId: a.id().required(),
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),

    // The driver's wishlist
    wishlist: a.hasOne('Wishlist', 'userId'),
    // The driver's cart
    cart: a.hasOne('Cart', 'userId'),
    // The driver's point accounts
    ptAccounts: a.hasMany('PTAccounts', 'driverId')

  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* An account holding a driver's point balance provided by a sponsor*/
  PTAccounts: a.model({
    
    driverId: a.id().required(),
    driver: a.belongsTo('Drivers', 'driverId'),

    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsors', 'sponsorId'),

    balance: a.integer()
  }).identifier(['driverId', 'sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* A user classified as a sponsor */
  Sponsors: a.model({
    userId: a.id().required(),
    // The sponsor's affilated company
    affiliation: a.string(),

    // The sponsor's said dollar to point conversion
    conversion: a.integer(),
    // The accounts the sponsor currently controls
    ptAccounts: a.hasMany('PTAccounts', 'sponsorId')

  }).identifier(['userId'])
  .authorization(allow => [allow.publicApiKey()]),

  /* A user of admin classification */
  Admins: a.model({
    userId: a.id().required()

    // TODO: Missing fields. To Be Implemented...

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
