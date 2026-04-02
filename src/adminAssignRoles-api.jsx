import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

async function authHeaders() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  console.log("id token exists?", !!token);
  console.log("token payload:", session.tokens?.idToken?.payload);

  return token ? { Authorization: token } : {};
}

export async function fetchUnassignedUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/unassigned",
  });

  const response = await restOperation.response;
  return response.body.json();
}

export async function assignUserGroup(username, groupName) {
  const restOperation = put({
    apiName: "SafeDriveAPI",
    path: `/admin/users/${encodeURIComponent(username)}/group`,
    options: {
      body: { groupName },
    },
  });

  return restOperation.response;
}