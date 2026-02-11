import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

function LogoutPage() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
        auth.signoutRedirect({ state: { postLogoutRedirectUri: '/' } });
    }
  }, [auth]);

  return null;
}

export default LogoutPage;