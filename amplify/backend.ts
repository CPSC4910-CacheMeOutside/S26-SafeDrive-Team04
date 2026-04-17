import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
  GatewayResponse,
  ResponseType,
} from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { adminUsersFunction } from './functions/adminManagementFeat/resource';
import { updateStorefront } from './functions/updateStorefront/resource';

const backend = defineBackend({
  auth,
  data,
  adminUsersFunction,
  updateStorefront
});

Object.values(backend.data.resources.tables).forEach(table => {
  table.grantReadWriteData(backend.updateStorefront.resources.lambda);
});

const userPool = backend.auth.resources.userPool;
const adminUserLambda = backend.adminUsersFunction.resources.lambda as LambdaFunction;

adminUserLambda.addEnvironment('USER_POOL_ID', userPool.userPoolId);

adminUserLambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:ListUsersInGroup',
      'cognito-idp:AdminGetUser',
      'cognito-idp:AdminUpdateUserAttributes',
      'cognito-idp:AdminListGroupsForUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminRemoveUserFromGroup',
    ],
    resources: [userPool.userPoolArn],
  })
);

const apiStack = backend.createStack('admin-api-stack');

adminUserLambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      'dynamodb:UpdateItem',
    ],
    resources: [
      `arn:aws:dynamodb:us-east-1:${Stack.of(apiStack).account}:table/DriverViewSession-opf5l7awlrcc7gwlw2c6ccmmca-NONE`,
    ],
  })
);

const adminApi = new RestApi(apiStack, 'AdminRestApi', {
  restApiName: 'SafeDriveAPI',
  deploy: true,
  deployOptions: {
    stageName: 'dev',
  },
  defaultCorsPreflightOptions: {
    allowOrigins: ['http://localhost:5173'],
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'x-driver-view-session',
    ],
  },
});

new GatewayResponse(apiStack, 'Default4xxGatewayResponse', {
  restApi: adminApi,
  type: ResponseType.DEFAULT_4XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'http://localhost:5173'",
    'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-driver-view-session'",
    'Access-Control-Allow-Methods': "'GET,PUT,POST,OPTIONS'",
  },
});

new GatewayResponse(apiStack, 'Default5xxGatewayResponse', {
  restApi: adminApi,
  type: ResponseType.DEFAULT_5XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'http://localhost:5173'",
    'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-driver-view-session'",
    'Access-Control-Allow-Methods': "'GET,PUT,POST,OPTIONS'",
  },
});

const lambdaIntegration = new LambdaIntegration(adminUserLambda);

const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, 'AdminCognitoAuth', {cognitoUserPools: [userPool]});


const adminPath = adminApi.root.addResource('admin');
const usersPath = adminPath.addResource('users');
const unassignedPath = usersPath.addResource('unassigned');

unassignedPath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const usersGroupPath = usersPath.addResource('group');
const groupNamePath = usersGroupPath.addResource('{groupname}');

groupNamePath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const driversPath = adminPath.addResource('drivers');
const driverIdPath = driversPath.addResource('{driverId}');

driverIdPath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

driverIdPath.addMethod('PUT', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const usernamePath = usersPath.addResource('{username}');
const groupPath = usernamePath.addResource('group');

groupPath.addMethod('PUT', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const driverViewPath = adminPath.addResource('driver-view');

const driverViewStartPath = driverViewPath.addResource('start');
driverViewStartPath.addMethod('POST', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const driverViewCurrentPath = driverViewPath.addResource('current');
driverViewCurrentPath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const driverViewDashboardPath = driverViewPath.addResource('dashboard');
driverViewDashboardPath.addMethod('GET', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

const driverViewStopPath = driverViewPath.addResource('stop');
driverViewStopPath.addMethod('POST', lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

backend.addOutput({
  custom: {
    API: {
      SafeDriveAPI: {
        endpoint: adminApi.url.replace(/\/$/, ''),
        region: Stack.of(apiStack).region,
        authorizationType: 'AMAZON_COGNITO_USER_POOLS',
      },
    },
  },
});

export { backend };

