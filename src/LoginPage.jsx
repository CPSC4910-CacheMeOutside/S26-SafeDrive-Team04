import { useEffect } from 'react';
import useAmplifyAuth from './UseAmplifyAuth';
import { useLanguage } from './LanguageContext';

function LoginPage() {
  const auth = useAmplifyAuth();
  const { t } = useLanguage();

  useEffect(() => {
    auth.signinRedirect();
  }, [auth]);

  return <div>{t('login.redirecting')}</div>;
}

export default LoginPage;