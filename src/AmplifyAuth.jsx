import {
  getCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

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

export { signInWithRedirect, signOut };