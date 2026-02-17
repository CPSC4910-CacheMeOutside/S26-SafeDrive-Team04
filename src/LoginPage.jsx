import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

function LoginPage() {
  const auth = useAuth();

  useEffect(() => {
    auth.signinRedirect();
  }, [auth]);

  return <div>Redirecting to login...</div>;
}

export default LoginPage;