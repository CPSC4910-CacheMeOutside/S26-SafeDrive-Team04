import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export async function fetchCurrentDriverAssignments() {
  const [currentUser, attributes] = await Promise.all([
    getCurrentUser(),
    fetchUserAttributes(),
  ]);

  const driverId = currentUser.username;

  const { data: relationships, errors: relErrors } =
    await client.models.DriverSponsor.list({
      filter: { driverId: { eq: driverId } },
    });

  if (relErrors && relErrors.length) {
    throw new Error(relErrors[0].message || "Failed to load driver assignments");
  }

  const rels = Array.isArray(relationships) ? relationships : [];

  const sponsors = await Promise.all(
    rels.map(async (rel) => {
      const { data: sponsor, errors } = await client.models.Sponsor.get({
        sponsorId: rel.sponsorId,
      });

      if (errors && errors.length) {
        throw new Error(errors[0].message || "Failed to load sponsor");
      }

      return {
        id: rel.sponsorId,
        name: sponsor?.affiliation || rel.sponsorId,
        status: "active",
        joinedDate: "",
        points: rel.points ?? 0,
      };
    })
  );

  const totalPoints = sponsors.reduce((sum, sponsor) => sum + (sponsor.points || 0), 0);

  return {
    driverId,
    fullName:
      attributes.name ||
      [attributes.given_name, attributes.family_name].filter(Boolean).join(" ") ||
      "",
    email: attributes.email || "",
    phoneNumber: attributes.phone_number || "",
    sponsors,
    totalPoints,
  };
}