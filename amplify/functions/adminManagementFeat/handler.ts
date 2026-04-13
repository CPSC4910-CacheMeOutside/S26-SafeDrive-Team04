import type { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersInGroupCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

const APP_GROUPS = ['Admin', 'Driver', 'Sponsor'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
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

function getAttributesMap(attributes?: { Name?: string; Value?: string }[]) {
  return Object.fromEntries(
    (attributes ?? []).map((a) => [a.Name ?? '', a.Value ?? ''])
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

    if (!isAdmin(event)) {
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
    const username = event.pathParameters?.username || event.pathParameters?.driverId;
    const groupname = event.pathParameters?.groupname;

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
        const result = await cognito.send(new ListUsersInGroupCommand({UserPoolId: userPoolId, GroupName: groupname, Limit: 60,}));
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
        error: error?.message ?? 'Unknown error',
      }),
    };
  }
  
};

