import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

function LogoutPage() {
  const auth = useAuth();

  useEffect(() => {
    const run = async () => {
      await auth.removeUser();

      const cognitoDomain = "https://us-east-17kwyoumwk.auth.us-east-1.amazoncognito.com";
      const clientId = "5qkcg4h6o51nq40der98l7qsvk";
      const logoutUri = "https://adminprofilepage.d2jawpaet8g6c9.amplifyapp.com/";

      window.location.assign(
        `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
      );
    };

    run();
  }, [auth]);

  return <div>Logging out...</div>;
}

export default LogoutPage;