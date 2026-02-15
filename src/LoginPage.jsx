import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

function LoginPage() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
        auth.signinRedirect();
    }
  }, [auth]);

  return null;
}

export default LoginPage;