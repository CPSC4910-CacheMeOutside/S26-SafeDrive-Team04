import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

function LogoutPage() {
  const auth = useAuth();

  auth.removeUser();

  useEffect(() => {
    const cognitoDomain = "https://us-east-17kWyOumWk.auth.us-east-1.amazoncognito.com";
    const clientId = "5qkcg4h6o51nq40der98l7qsvk";
    const logoutUri = "https://sponsor-profile-page.d2jawpaet8g6c9.amplifyapp.com/";

    localStorage.clear();
    sessionStorage.clear();

    //let logoutUri = "http://localhost:3000";
    if (window.location.hostname.includes("amplifyapp.com")) {
      logoutUri = window.location.href.split("/")[0] + "//" + window.location.hostname;
    }

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

  }, []);

  return null;
}

export default LogoutPage;