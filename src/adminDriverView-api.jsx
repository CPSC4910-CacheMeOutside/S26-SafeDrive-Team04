import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../amplify_outputs.json';

const API_BASE_URL = outputs.custom.API.SafeDriveAPI.endpoint;

async function parseJsonResponse(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function startDriverView(driverUsername) {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error('Missing id token.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/driver-view/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ driverUsername }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to start driver view.');
  }

  return data;
}

export async function getCurrentDriverView(sessionId) {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error('Missing id token.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/driver-view/current`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'x-driver-view-session': sessionId,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load driver view session.');
  }

  return data;
}

export async function getDriverViewDashboard(sessionId) {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error('Missing id token.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/driver-view/dashboard`, {
    method: 'GET',
    headers: {
      Authorization: idToken,
      'x-driver-view-session': sessionId,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load driver dashboard.');
  }

  return data;
}

export async function stopDriverView(sessionId) {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();

  if (!idToken) {
    throw new Error('Missing id token.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/driver-view/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to stop driver view.');
  }

  return data;
}