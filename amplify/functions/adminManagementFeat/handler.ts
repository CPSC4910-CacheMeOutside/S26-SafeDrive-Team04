import type { APIGatewayProxyHandler } from 'aws-lambda';
import crypto from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersInGroupCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const driverViewTable = 'DriverViewSession-opf5l7awlrcc7gwlw2c6ccmmca-NONE';

const driverTable = 'Driver-opf5l7awlrcc7gwlw2c6ccmmca-NONE';
const driverSponsorTable = 'DriverSponsor-opf5l7awlrcc7gwlw2c6ccmmca-NONE';
const sponsorTable = 'Sponsor-opf5l7awlrcc7gwlw2c6ccmmca-NONE';

const APP_GROUPS = ['Admin', 'Driver', 'Sponsor'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dev.d2jawpaet8g6c9.amplifyapp.com',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-driver-view-session',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
};

function getClaims(event: any) {
  return (
    (event.requestContext as any)?.authorizer?.claims ??
    (event.requestContext as any)?.authorizer?.jwt?.claims ??
    {}
  );
}

function getUserGroupsFromClaims(event: any): string[] {
  const claims = getClaims(event);
  const rawGroups = claims['cognito:groups'];

  if (Array.isArray(rawGroups)) return rawGroups;
  if (typeof rawGroups === 'string') {
    return rawGroups
      .split(',')
      .map((g: string) => g.trim())
      .filter(Boolean);
  }

  return [];
}

function isAdmin(event: any): boolean {
  return getUserGroupsFromClaims(event).includes('Admin');
}

function isSponsor(event: any): boolean {
  return getUserGroupsFromClaims(event).includes('Sponsor');
}

function getAttributesMap(attributes?: { Name?: string; Value?: string }[]) {
  return Object.fromEntries(
    (attributes ?? []).map((a) => [a.Name ?? '', a.Value ?? ''])
  );
}

function getClaimSub(event: any): string {
  const claims = getClaims(event);
  return claims.sub ?? '';
}

function getHeader(event: any, name: string): string | undefined {
  const headers = event.headers ?? {};
  return (
    headers[name] ||
    headers[name.toLowerCase()] ||
    headers[name.toUpperCase()]
  );
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    if (!isAdmin(event) && !isSponsor(event)) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Not authorized' }),
      };
    }

    const userPoolId = process.env.USER_POOL_ID;

    if (!userPoolId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Missing USER_POOL_ID' }),
      };
    }

    const path = event.path || '';
    const username =
      event.pathParameters?.username || event.pathParameters?.driverId;
    const groupname = event.pathParameters?.groupname;
    if (event.httpMethod === 'POST' && path.endsWith('/admin/users')) {
      const body = JSON.parse(event.body || '{}');

      const { username, email, temporaryPassword, group } = body;

      if (!username || !email || !temporaryPassword) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing required fields' }),
        };
      }

      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: username,
          TemporaryPassword: temporaryPassword,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
        })
      );

      if (group && APP_GROUPS.includes(group)) {
        await cognito.send(
          new AdminAddUserToGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: group,
          })
        );
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'User created successfully' }),
      };
    }

    if (event.httpMethod === 'DELETE' && path.includes('/admin/users/') && username) {
      await cognito.send(
        new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'User deleted successfully' }),
      };
    }

    if (event.httpMethod === 'GET' && path.endsWith('/admin/users/unassigned')) {
      const result = await cognito.send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          Limit: 60,
        })
      );

      const users = result.Users ?? [];

      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const cognitoUsername = user.Username ?? '';

          const groupsResult = await cognito.send(
            new AdminListGroupsForUserCommand({
              UserPoolId: userPoolId,
              Username: cognitoUsername,
            })
          );

          const groupNames = (groupsResult.Groups ?? [])
            .map((g) => g.GroupName)
            .filter(Boolean) as string[];

          const appGroups = groupNames.filter((g) =>
            APP_GROUPS.includes(g as (typeof APP_GROUPS)[number])
          );

          const attrs = getAttributesMap(user.Attributes);

          return {
            username: cognitoUsername,
            email: attrs.email ?? '',
            name: attrs.name ?? '',
            preferred_username: attrs.preferred_username ?? '',
            nickname: attrs.nickname ?? '',
            phone_number: attrs.phone_number ?? '',
            status: user.UserStatus ?? '',
            enabled: user.Enabled ?? false,
            groups: appGroups,
          };
        })
      );

      const unassignedUsers = enrichedUsers.filter((user) => user.groups.length === 0);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(unassignedUsers),
      };
    }

    if (event.httpMethod === 'GET' && path.includes('/admin/users/group/') && groupname) {
      const result = await cognito.send(
        new ListUsersInGroupCommand({
          UserPoolId: userPoolId,
          GroupName: groupname,
          Limit: 60,
        })
      );

      const users = (result.Users ?? []).map((user) => {
        const attrs = getAttributesMap(user.Attributes);

        return {
          username: user.Username ?? '',
          email: attrs.email ?? '',
          name: attrs.name ?? '',
          preferred_username: attrs.preferred_username ?? '',
          nickname: attrs.nickname ?? '',
          phone_number: attrs.phone_number ?? '',
          enabled: user.Enabled ?? false,
          status: user.UserStatus ?? '',
          groups: [groupname],
        };
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(users),
      };
    }

    if (event.httpMethod === 'PUT' && path.endsWith('/group')) {
      if (!username) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing username' }),
        };
      }

      const body = JSON.parse(event.body || '{}');
      const groupName = body.groupName;

      if (!groupName || !APP_GROUPS.includes(groupName)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: 'groupName must be one of Admin, Driver, Sponsor',
          }),
        };
      }

      const existingGroups = await cognito.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        })
      );

      for (const group of existingGroups.Groups ?? []) {
        const existingGroupName = group.GroupName;
        if (existingGroupName && APP_GROUPS.includes(existingGroupName as any)) {
          await cognito.send(
            new AdminRemoveUserFromGroupCommand({
              UserPoolId: userPoolId,
              Username: username,
              GroupName: existingGroupName,
            })
          );
        }
      }

      await cognito.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: username,
          GroupName: groupName,
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: `${username} assigned to ${groupName}`,
        }),
      };
    }

    console.log('ENV CHECK', {
      DRIVER_TABLE_NAME: process.env.DRIVER_TABLE_NAME,
      DRIVER_SPONSOR_TABLE_NAME: process.env.DRIVER_SPONSOR_TABLE_NAME,
      SPONSOR_TABLE_NAME: process.env.SPONSOR_TABLE_NAME,
    });

    if (event.httpMethod === 'POST' && path.endsWith('/admin/driver-view/start')) {
      const adminSub = getClaimSub(event);

      if (!adminSub) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing admin identity' }),
        };
      }

      const body = JSON.parse(event.body || '{}');
      const driverUsername = body.driverUsername;

      if (!driverUsername) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing driverUsername' }),
        };
      }

      const driverResult = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: driverUsername,
        })
      );

      const driverGroups = await cognito.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: userPoolId,
          Username: driverUsername,
        })
      );

      const isDriverUser = (driverGroups.Groups ?? []).some(
        (g) => g.GroupName === 'Driver'
      );

      if (!isDriverUser) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Selected user is not a driver' }),
        };
      }

      const attrs = getAttributesMap(driverResult.UserAttributes);
      const sessionId = crypto.randomUUID();
      const expiresAt = Date.now() + 1000 * 60 * 30;

      const driverName =
        attrs.name ??
        attrs.preferred_username ??
        attrs.email ??
        driverUsername;

      await ddb.send(
        new PutCommand({
          TableName: driverViewTable,
          Item: {
            sessionId,
            adminSub,
            driverUsername,
            driverSub: attrs.sub ?? '',
            driverName,
            expiresAt,
            active: true,
          },
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          sessionId,
          driverUsername,
          driverName,
          expiresAt,
        }),
      };
    }

    if (event.httpMethod === 'GET' && path.endsWith('/admin/driver-view/current')) {
      const adminSub = getClaimSub(event);

      if (!adminSub) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing admin identity' }),
        };
      }

      const sessionId = getHeader(event, 'x-driver-view-session');

      if (!sessionId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing x-driver-view-session header' }),
        };
      }

      const sessionResult = await ddb.send(
        new GetCommand({
          TableName: driverViewTable,
          Key: { sessionId },
        })
      );

      const session = sessionResult.Item;

      if (!session) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Driver view session not found' }),
        };
      }

      if (session.adminSub !== adminSub) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Session does not belong to this admin' }),
        };
      }

      if (!session.active || session.expiresAt < Date.now()) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Driver view session expired' }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(session),
      };
    }

    if (event.httpMethod === 'GET' && path.endsWith('/admin/driver-view/dashboard')) {
      if (!driverTable || !driverSponsorTable || !sponsorTable) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            message: 'Missing dashboard table env vars',
            driverTable,
            driverSponsorTable,
            sponsorTable,
          }),
        };
      }

      const adminSub = getClaimSub(event);

      if (!adminSub) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing admin identity' }),
        };
      }

      const sessionId = getHeader(event, 'x-driver-view-session');

      if (!sessionId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing x-driver-view-session header' }),
        };
      }

      const sessionResult = await ddb.send(
        new GetCommand({
          TableName: driverViewTable,
          Key: { sessionId },
        })
      );

      const session = sessionResult.Item as
        | {
            sessionId: string;
            adminSub: string;
            driverUsername: string;
            driverSub?: string;
            driverName?: string;
            expiresAt: number;
            active: boolean;
          }
        | undefined;

      if (!session) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Driver view session not found' }),
        };
      }

      if (session.adminSub !== adminSub) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Session does not belong to this admin' }),
        };
      }

      if (!session.active || session.expiresAt < Date.now()) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Driver view session expired' }),
        };
      }

      const driverResult = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: session.driverUsername,
        })
      );

      const driverGroups = await cognito.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: userPoolId,
          Username: session.driverUsername,
        })
      );

      const attrs = getAttributesMap(driverResult.UserAttributes);

      const groups = (driverGroups.Groups ?? [])
        .map((g) => g.GroupName)
        .filter(Boolean) as string[];

      const isDriverUser = groups.includes('Driver');

      if (!isDriverUser) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Selected user is not a driver' }),
        };
      }

      const fullName =
        attrs.name ??
        [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') ??
        '';

      const driverId = session.driverUsername;

      const driverRecordResult = await ddb.send(
        new GetCommand({
          TableName: driverTable,
          Key: { driverId },
        })
      );
      const driverRecord = driverRecordResult.Item ?? {};
      const totalPoints = driverRecord.points ?? 0;

      const driverSponsorResult = await ddb.send(
        new ScanCommand({
          TableName: driverSponsorTable,
          FilterExpression: 'driverId = :driverId',
          ExpressionAttributeValues: {
            ':driverId': driverId,
          },
        })
      );

      const driverSponsorItems = Array.isArray(driverSponsorResult.Items)
        ? driverSponsorResult.Items
        : [];

      const sponsors = await Promise.all(
        driverSponsorItems.map(async (rel: any) => {
          let sponsorName = rel.sponsorId;
          try {
            const sponsorResult = await ddb.send(
              new GetCommand({
                TableName: sponsorTable,
                Key: { sponsorId: rel.sponsorId },
              })
            );
            sponsorName =
              sponsorResult.Item?.affiliation ||
              sponsorResult.Item?.name ||
              rel.sponsorId;
          } catch (error) {
            console.error('Failed to load sponsor', rel.sponsorId, error);
          }
          return {
            id: rel.sponsorId,
            name: sponsorName,
            points: rel.points ?? 0,
            status: 'active',
          };
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          id: session.driverSub ?? attrs.sub ?? '',
          subId: session.driverSub ?? attrs.sub ?? '',
          username: session.driverUsername,
          fullName: fullName || session.driverName || '',
          name: fullName || session.driverName || '',
          email: attrs.email ?? '',
          phoneNumber: attrs.phone_number ?? '',
          groups,
          points: totalPoints,
          sponsors,
          applications: [],
        }),
      };
    }

    if (event.httpMethod === 'POST' && path.endsWith('/admin/driver-view/stop')) {
      const adminSub = getClaimSub(event);
      const body = JSON.parse(event.body || '{}');
      const sessionId = body.sessionId;

      if (!sessionId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing sessionId' }),
        };
      }

      const sessionResult = await ddb.send(
        new GetCommand({
          TableName: driverViewTable,
          Key: { sessionId },
        })
      );

      const session = sessionResult.Item;

      if (!session) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Session not found' }),
        };
      }

      if (session.adminSub !== adminSub) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Not authorized to stop this session' }),
        };
      }

      await ddb.send(
        new UpdateCommand({
          TableName: driverViewTable,
          Key: { sessionId },
          UpdateExpression: 'SET active = :a',
          ExpressionAttributeValues: {
            ':a': false,
          },
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Driver view stopped' }),
      };
    }

    if (event.httpMethod === 'GET' && username) {
      const result = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        })
      );

      const attrs = getAttributesMap(result.UserAttributes);

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

    if (event.httpMethod === 'PUT' && username) {
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
          Username: username,
          UserAttributes: updates,
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'User updated successfully' }),
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
        error: error?.message,
        stack: error?.stack,
      }),
    };

    
  }
  

};

