import type { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminGetUserCommand, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims =
      (event.requestContext.authorizer as any)?.claims || {};

    const groups = claims["cognito:groups"] || [];
    const isAdmin =
      Array.isArray(groups) ? groups.includes("Admin") : groups === "Admin";

    if (!isAdmin) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Not authorized" }),
      };
    }

    const userPoolId = process.env.USER_POOL_ID;
    const driverId = event.pathParameters?.driverId;

    if (!userPoolId || !driverId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Missing USER_POOL_ID or driverId" }),
      };
    }

    if (event.httpMethod === "GET") {
      const result = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: driverId,
        })
      );

      const attrs = Object.fromEntries(
        (result.UserAttributes || []).map((a) => [a.Name, a.Value])
      );

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({
          username: result.Username,
          name: attrs.name || "",
          preferred_username: attrs.preferred_username || "",
          phone_number: attrs.phone_number || "",
          email: attrs.email || "",
          groups: ["Driver"],
        }),
      };
    }

    if (event.httpMethod === "PUT") {
      const body = JSON.parse(event.body || "{}");

      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: driverId,
          UserAttributes: [
            { Name: "name", Value: body.name || "" },
            { Name: "preferred_username", Value: body.preferred_username || "" },
            { Name: "phone_number", Value: body.phone_number || "" },
            { Name: "email", Value: body.email || "" },
          ],
        })
      );

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Driver updated successfully" }),
      };
    }

    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        message: "Server error",
        error: error.message,
      }),
    };
  }
};