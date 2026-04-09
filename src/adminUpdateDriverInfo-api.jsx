import { get } from "aws-amplify/api";

export async function fetchDriverUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Driver",
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function fetchSponsorGroupUsers() {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Sponsor",
  });

  const { body } = await restOperation.response;
  return await body.json();
}