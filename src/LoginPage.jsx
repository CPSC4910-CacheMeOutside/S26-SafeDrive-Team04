import { useEffect } from 'react';
import useAmplifyAuth from './UseAmplifyAuth';

function LoginPage() {
  const auth = useAmplifyAuth();

  useEffect(() => {
    auth.signinRedirect();
  }, [auth]);

  return <div>Redirecting to login...</div>;
}

export default LoginPage;