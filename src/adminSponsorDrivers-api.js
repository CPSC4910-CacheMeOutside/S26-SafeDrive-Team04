import { get, post } from "aws-amplify/api";

export async function fetchDriversForSponsor(sponsorUsername) {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: `/admin/sponsors/${encodeURIComponent(sponsorUsername)}/drivers`,
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function adjustDriverPoints({
  sponsorUsername,
  driverUsername,
  amount,
  reason,
}) {
  const restOperation = post({
    apiName: "SafeDriveAPI",
    path: `/admin/sponsors/${encodeURIComponent(sponsorUsername)}/drivers/${encodeURIComponent(driverUsername)}/points`,
    options: {
      body: {
        amount,
        reason,
      },
    },
  });

  const { body } = await restOperation.response;
  return await body.json();
}

export async function fetchSponsorAdjustmentLogs(sponsorUsername) {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: `/admin/sponsors/${encodeURIComponent(sponsorUsername)}/logs`,
  });

  const { body } = await restOperation.response;
  return await body.json();
}