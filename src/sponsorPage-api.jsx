import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";

const client = generateClient();

async function fetchDriverProfileById(driverId, idToken) {
  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: `/admin/drivers/${encodeURIComponent(driverId)}`,
    options: {
      headers: {
        Authorization: idToken,
      },
    },
  });

  const response = await restOperation.response;
  return await response.body.json();
}

export async function fetchCurrentSponsorAssignments() {
  const [currentUser, attributes, session] = await Promise.all([
    getCurrentUser(),
    fetchUserAttributes(),
    fetchAuthSession(),
  ]);

  const sponsorId = currentUser.username;
  const idToken = session.tokens?.idToken?.toString();

  const { data: relationships, errors: relErrors } =
    await client.models.DriverSponsor.list({
      filter: { sponsorId: { eq: sponsorId } },
    });

  if (relErrors && relErrors.length) {
    throw new Error(
      relErrors[0].message || "Failed to load sponsor assignments"
    );
  }

  const rels = Array.isArray(relationships) ? relationships : [];

  const drivers = await Promise.all(
    rels.map(async (rel) => {
      let profile = {};

      try {
        if (idToken) {
          profile = await fetchDriverProfileById(rel.driverId, idToken);
        }
      } catch (err) {
        console.error(`Failed to load driver profile for ${rel.driverId}`, err);
      }

      return {
        driverId: rel.driverId,
        sponsorId: rel.sponsorId,
        driverSponsorId: `${rel.driverId}-${rel.sponsorId}`,
        points: rel.points ?? 0,
        driverName: profile.name || "",
        driverNickname: profile.nickname || "",
        driverEmail: profile.email || "",
        driverPhone: profile.phone_number || "",
      };
    })
  );

  const totalPoints = drivers.reduce(
    (sum, driver) => sum + (driver.points || 0),
    0
  );

  return {
    sponsorId,
    fullName:
      attributes.name ||
      [attributes.given_name, attributes.family_name]
        .filter(Boolean)
        .join(" ") ||
      "",
    email: attributes.email || "",
    affiliation: attributes["custom:affiliation"] || "",
    totalPoints,
    drivers,
  };
}