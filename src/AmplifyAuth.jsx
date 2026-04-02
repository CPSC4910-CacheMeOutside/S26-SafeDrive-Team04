import {getCurrentUser, fetchAuthSession, signInWithRedirect, signOut} from "aws-amplify/auth";
import outputs from "../amplify_outputs.json";

export async function getAmplifyAuthState() {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();

    const idToken = session.tokens?.idToken?.toString() ?? "";
    const accessToken = session.tokens?.accessToken?.toString() ?? "";
    const profile = session.tokens?.idToken?.payload ?? {};
    const groups = profile["cognito:groups"] ?? [];

    return {
      isAuthenticated: true,
      user,
      idToken,
      accessToken,
      profile,
      groups,
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      idToken: "",
      accessToken: "",
      profile: {},
      groups: [],
    };
  }
}

export function signupRedirect() {
  const domain = outputs.auth?.oauth?.domain;
  const clientId = outputs.auth?.user_pool_client_id;
  const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
  const scope = encodeURIComponent("openid email profile");

  const url =
    `https://${domain}/signup?client_id=${clientId}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&redirect_uri=${redirectUri}`;

  window.location.href = url;
}

export { signInWithRedirect, signOut };