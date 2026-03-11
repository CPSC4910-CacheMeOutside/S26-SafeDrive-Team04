import { useEffect, useState, useCallback } from 'react';
import { getAmplifyAuthState, signInWithRedirect, signOut } from './AmplifyAuth';

export default function useAmplifyAuth() {
  const [auth, setAuth] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    idToken: "",
    accessToken: "",
    profile: {},
    groups: [],
  });

  const refreshAuth = useCallback(async () => {
    setAuth((prev) => ({ ...prev, isLoading: true }));
    const next = await getAmplifyAuthState();
    setAuth({ ...next, isLoading: false });
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return {
    ...auth,
    refreshAuth,
    signinRedirect: () => signInWithRedirect(),
    signoutRedirect: () => signOut(),
  };
}