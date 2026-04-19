import { useEffect } from 'react';
import useAmplifyAuth from './UseAmplifyAuth';
import { useLanguage } from './LanguageContext';

function LogoutPage() {
  const auth = useAmplifyAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const run = async () => {
      await auth.removeUser();

      const cognitoDomain = "https://us-east-17kwyoumwk.auth.us-east-1.amazoncognito.com";
      const clientId = "5qkcg4h6o51nq40der98l7qsvk";
      const logoutUri = "http://localhost:5173/";

      window.location.assign(
        `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
      );
    };

    run();
  }, [auth]);

  return <div>{t('logout.loggingOut')}</div>;
}

export default LogoutPage;