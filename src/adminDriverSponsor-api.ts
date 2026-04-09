import { generateClient } from 'aws-amplify/data';
import type { AboutSchema } from '../amplify/data/resource';

const client = generateClient<AboutSchema>();

type PendingUser = {
  username: string;
  name?: string;
  email?: string;
};

export async function fetchSponsorUsers() {
  const { data, errors } = await client.models.Sponsor.list();

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to fetch sponsors");
  }

  return data ?? [];
}

export async function fetchDriverUsersFromData() {
  const { data, errors } = await client.models.Driver.list();

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to fetch drivers");
  }

  return data ?? [];
}

export async function assignDriverToSponsor(driverId: string, sponsorId: string) {
  // guard against duplicate relationships
  const existing = await fetchSponsorRelationships(sponsorId);
  const alreadyExists = (existing ?? []).some(
    (rel) => rel.driverId === driverId && rel.sponsorId === sponsorId
  );

  if (alreadyExists) {
    return {
      driverId,
      sponsorId,
      points: existing.find(
        (rel) => rel.driverId === driverId && rel.sponsorId === sponsorId
      )?.points ?? 0,
    };
  }

  const { data, errors } = await client.models.DriverSponsor.create({
    driverId,
    sponsorId,
    points: 0,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to assign driver to sponsor");
  }

  return data;
}

export async function fetchSponsorRelationships(sponsorId: string) {
  const { data, errors } = await client.models.DriverSponsor.list({
    filter: { sponsorId: { eq: sponsorId } },
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to fetch sponsor relationships");
  }

  return data ?? [];
}

export async function removeDriverFromSponsor(driverId: string, sponsorId: string) {
  const { data, errors } = await client.models.DriverSponsor.delete({
    driverId,
    sponsorId,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to remove driver from sponsor");
  }

  return data;
}

export async function ensureSponsorRecord(user: PendingUser) {
  const sponsorId = user.username;

  const existing = await client.models.Sponsor.get({ sponsorId });
  if (existing.data) return existing.data;

  const { data, errors } = await client.models.Sponsor.create({
    sponsorId,
    affiliation: user.name || user.email || user.username,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to create sponsor record");
  }

  return data;
}

export async function ensureDriverRecord(user: PendingUser) {
  const driverId = user.username;

  // use get first since driverId is the identifier
  const existing = await client.models.Driver.get({ driverId });
  if (existing.data) return existing.data;

  const { data, errors } = await client.models.Driver.create({
    driverId,
    points: 0,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to create driver record");
  }

  return data;
}

export async function ensureDriverRecords(users: PendingUser[]) {
  const ensuredDrivers = [];

  for (const user of users) {
    const driverRecord = await ensureDriverRecord(user);
    if (driverRecord) {
      ensuredDrivers.push(driverRecord);
    }
  }

  return ensuredDrivers;
}

export async function updateDriverSponsorPoints(
  driverId: string,
  sponsorId: string,
  points: number
) {
  const { data, errors } = await client.models.DriverSponsor.update({
    driverId,
    sponsorId,
    points,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to update driver sponsor points");
  }

  return data;
}