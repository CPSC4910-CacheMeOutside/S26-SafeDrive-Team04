import type { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
};

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    const claims = (event.requestContext as any)?.authorizer?.claims ?? (event.requestContext as any)?.authorizer?.jwt?.claims ?? {};
    const rawGroups = claims['cognito:groups'];
    const groups = Array.isArray(rawGroups) ? rawGroups : typeof rawGroups === 'string' ? rawGroups.split(',').map((g: string) => g.trim()).filter(Boolean) : [];

    if (!groups.includes('Admin')) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Not authorized' }),
      };
    }

    const userPoolId = process.env.USER_POOL_ID;
    const driverId = event.pathParameters?.driverId;

    if (!userPoolId || !driverId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Missing USER_POOL_ID or driverId' }),
      };
    }

    if (event.httpMethod === 'GET') {
      const result = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: driverId,
        })
      );

      const attrs = Object.fromEntries(
        (result.UserAttributes ?? []).map((a) => [a.Name!, a.Value ?? ''])
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          email: attrs.email ?? '',
          name: attrs.name ?? '',
          nickname: attrs.nickname ?? '',
          phone_number: attrs.phone_number ?? '',
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');

      const updates = [
        body.email !== undefined ? { Name: 'email', Value: String(body.email) } : null,
        body.name !== undefined ? { Name: 'name', Value: String(body.name) } : null,
        body.nickname !== undefined ? { Name: 'nickname', Value: String(body.nickname) } : null,
        body.phone_number !== undefined
          ? { Name: 'phone_number', Value: String(body.phone_number) }
          : null,
      ].filter(Boolean) as { Name: string; Value: string }[];

      if (updates.length === 0) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'No attributes provided to update' }),
        };
      }

      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: driverId,
          UserAttributes: updates,
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Driver updated successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error(error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Server error',
        error: error?.message ?? 'Unknown error',
      }),
    };
  }
};