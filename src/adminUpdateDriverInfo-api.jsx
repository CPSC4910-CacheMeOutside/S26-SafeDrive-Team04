import { get } from "aws-amplify/api";
import { fetchAuthSession } from 'aws-amplify/auth';

export async function fetchDriverUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Driver",
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function fetchSponsorUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Sponsor",
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function fetchAssignedDriverUsersForSponsor() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/sponsor/drivers",
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function fetchAdminUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Admin",
  });

  const { body } = await restOperation.response;
  return await body.json();
}