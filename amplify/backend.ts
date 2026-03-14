import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { adminTakeover } from './functions/adminManagementFeat/resource';

const backend = defineBackend({
  auth,
  data,
  adminTakeover,
});

const userPool = backend.auth.resources.userPool;
const adminTakeoverLambda = backend.adminTakeover.resources.lambda as LambdaFunction;

adminTakeoverLambda.addEnvironment('USER_POOL_ID', userPool.userPoolId);

adminTakeoverLambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:AdminGetUser',
      'cognito-idp:AdminUpdateUserAttributes',
    ],
    resources: [userPool.userPoolArn],
  })
);

const apiStack = backend.createStack('admin-api-stack');

const adminApi = new RestApi(apiStack, 'AdminRestApi', {
  restApiName: 'adminApi',
  deploy: true,
  deployOptions: {
    stageName: 'dev',
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const lambdaIntegration = new LambdaIntegration(adminTakeoverLambda);

const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, 'AdminCognitoAuth', {
  cognitoUserPools: [userPool],
});

const adminPath = adminApi.root.addResource('admin');
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

backend.addOutput({
  custom: {
    API: {
      [adminApi.restApiName]: {
        endpoint: adminApi.url,
        region: Stack.of(adminApi).region,
        apiName: adminApi.restApiName,
      },
    },
  },
});

