import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export async function fetchCurrentSponsorAssignments() {
  const [currentUser, attributes] = await Promise.all([
    getCurrentUser(),
    fetchUserAttributes(),
  ]);

  const sponsorId = currentUser.username;

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

  const drivers = rels.map((rel) => ({
    driverId: rel.driverId,
    sponsorId: rel.sponsorId,
    driverSponsorId: `${rel.driverId}-${rel.sponsorId}`,
    points: rel.points ?? 0,
  }));

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
  