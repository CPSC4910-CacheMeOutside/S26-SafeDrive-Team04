import { generateClient } from 'aws-amplify/data';
import type { AboutSchema } from '../amplify/data/resource';

const client = generateClient<AboutSchema>();

export async function fetchSponsorUsers() {
  const { data } = await client.models.Sponsor.list();
  return data ?? [];
}

export async function fetchDriverUsersFromData() {
  const { data } = await client.models.Driver.list();
  return data ?? [];
}

export async function assignDriverToSponsor(driverId: string, sponsorId: string) {
  return client.models.DriverSponsor.create({
    driverId,
    sponsorId,
    points: 0,
  });
}

export async function fetchSponsorRelationships(sponsorId: string) {
  const { data } = await client.models.DriverSponsor.list({
    filter: { sponsorId: { eq: sponsorId } },
  });
  return data ?? [];
}

export async function removeDriverFromSponsor(driverId: string, sponsorId: string) {
  return client.models.DriverSponsor.delete({
    driverId,
    sponsorId,
  });
}


export async function ensureSponsorRecord(user: any) {
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


type PendingUser = {
  username: string;
  name?: string;
  email?: string;
};

export async function ensureDriverRecord(user: PendingUser) {
  const driverId = user.username;

  const existing = await client.models.Driver.list({
    filter: { driverId: { eq: driverId } },
  });

  if (existing.data && existing.data.length > 0) {
    return existing.data[0];
  }

  const { data, errors } = await client.models.Driver.create({
    driverId,
    points: 0,
  });

  if (errors && errors.length) {
    throw new Error(errors[0].message || "Failed to create driver record");
  }

  return data;
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