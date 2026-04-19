import { a, defineData, type ClientSchema} from '@aws-amplify/backend';
import { updateStorefront } from '../functions/updateStorefront/resource';
 
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
 
  // A admin class user
  Admin: a.model({
    adminId: a.id().required(),
  }).identifier(['adminId'])
  .authorization(allow => [
    allow.groups(['Admin'])
  ]),
 
  // A sponsor class user
  Sponsor: a.model({
    sponsorId: a.id().required(),
    affiliation: a.string(),
    pointToDollarRatio: a.float().default(1),

    drivers: a.hasMany("DriverSponsor", 'sponsorId'),
    applications: a.hasMany('Application', 'sponsorId'),
    catalog: a.hasOne("Catalog", "sponsorId")
  })
  .identifier(['sponsorId'])
  .authorization(allow => [
    allow.groups(['Admin']),
    allow.groups(['Sponsor']),
    allow.publicApiKey()
  ]),

  // A model that assigns sponsors to drivers and vise versa 
  DriverSponsor: a.model({
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId'),
    sponsorId: a.id().required(),
    sponsor: a.belongsTo('Sponsor', 'sponsorId'),

    // The total number of points the sponsor has rewarded the driver
    points: a.integer().default(0)
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
    licenseNo: a.string(),
    state: a.string(),
    expDate: a.string(),

    // TODO: This attribute is being depriciated in favor of the new SponsorDriver schema 
    points: a.integer().default(0),

    sponsors: a.hasMany("DriverSponsor", "driverId"),
    wishlist: a.hasOne('Wishlist', 'driverId'),
    cart: a.hasOne('Cart', 'driverId'),
    catalogs: a.hasMany("Catalog", "driverId"),
    applications: a.hasMany('Application', 'driverId'),
  })
  .identifier(['driverId'])
  .authorization(allow => [
    allow.groups(['Admin']),
    allow.groups(['Sponsor']),
    allow.groups(['Driver']),
    allow.publicApiKey()
  ]),

  Catalog: a.model({
    driverId: a.id().required(),
    drivers: a.belongsTo("Driver", "driverId"),
    sponsorId: a.id().required(),
    sponsors: a.belongsTo("Sponsor", "sponsorId"),

    products: a.hasMany("CatalogProduct", ['driverId', 'sponsorId'])
  }).identifier(['driverId', 'sponsorId'])
  .authorization(allow => [allow.publicApiKey()]),

  CatalogProduct: a.model({
    driverId: a.id().required(),
    sponsorId: a.id().required(),
    catalog: a.belongsTo("Catalog", ['driverId', 'sponsorId']),

    pId: a.id().required(),
    product: a.belongsTo('Product', "pId")
  }).identifier(['driverId', 'sponsorId', 'pId'])
  .authorization(allow => [allow.publicApiKey()]),

  Cart : a.model({
    cartId: a.id(),
    driverId: a.id(),

    driver: a.belongsTo("Driver", "driverId"),
    products: a.hasMany("CartProduct", "cartId")

  }).identifier(['cartId'])
  .authorization(allow => [allow.publicApiKey()]),

  CartProduct: a.model({
    cartId: a.id().required(),
    cart: a.belongsTo('Cart', 'cartId'),
    pId: a.id().required(),
    product: a.belongsTo('Product', 'pId')
  }).identifier(['cartId', 'pId'])
  .authorization(allow => [allow.publicApiKey()]),

  Wishlist: a.model({
    wishId: a.id().required(),
    driverId: a.id().required(),
    driver: a.belongsTo('Driver', 'driverId'),
    products: a.hasMany("WishlistProduct", "wishId")
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
    wishlist: a.belongsTo("Wishlist", "wishId"),
    pId: a.id().required(),
    product: a.belongsTo("Product", "pId")
  }).identifier(['wishId', 'pId'])
  .authorization(allow => [allow.publicApiKey()]),

  Order : a.model({
    oId: a.id(),
    driverId: a.id().required(),
    sponsorId: a.id().required(),
    time: a.string().required(),
    status: a.integer().required(),

    products: a.hasMany("OrderProduct", ['oId'])

  }).identifier(["oId"])
  .authorization(allow => [allow.publicApiKey()]),

  OrderProduct: a.model({
    oId: a.id().required(),
    order: a.belongsTo("Order", "oId"),
    pId: a.id().required(),
  })
  .identifier(["oId", "pId"])
  .authorization(allow => [allow.publicApiKey()]),
 
  Product: a.model({
    pId: a.id().required(),
    title: a.string(),
    imgs: a.json(),
    synop: a.string(),
    category: a.string(),
    price: a.float(),
    desc: a. string(),
    available: a.boolean(),

    carts: a.hasMany("CartProduct", "pId"),
    wishlists: a.hasMany("WishlistProduct", "pId"),
    catalogs: a.hasMany("CatalogProduct", "pId"),
    orders: a.hasMany("OrderProduct", "pId")
  }).identifier(['pId'])
  .authorization(allow => [allow.publicApiKey()]),

  Notification: a.model({
    nId: a.id().required(),
    content: a.string(),

    userNotifications: a.hasMany('UserNotification', 'nId'),
  }).identifier(['nId'])
  .authorization(allow => [allow.publicApiKey()]),
  
  UserNotification: a.model({
    sendId: a.id().required(),
    recipId: a.id().required(),
    nId: a.id().required(),

    notification: a.belongsTo('Notification', 'nId'),
  }).identifier(['sendId', 'recipId', 'nId'])
  .authorization(allow => [allow.publicApiKey()]),

  DriverViewSession: a.model({
    sessionId: a.id().required(),
    adminSub: a.string().required(),
    driverUsername: a.string().required(),
    driverSub: a.string(),
    driverName: a.string(),
    expiresAt: a.integer().required(),
    active: a.boolean().default(true),
  }).identifier(['sessionId'])
  .authorization(allow => [allow.groups(['Admin'])]),

}).authorization(allow => [allow.resource(updateStorefront).to(["mutate", "query"])]);
 
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