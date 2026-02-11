import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

function LogoutPage() {
  const auth = useAuth();

  auth.removeUser();

  useEffect(() => {
    const clientId = "5qkcg4h6o51nq40der98l7qsvk";
    const logoutUri = "http://localhost:3000/";
    const cognitoDomain = "https://us-east-17kWyOumWk.auth.us-east-1.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

  }, []);

  return null;
}

export default LogoutPage;