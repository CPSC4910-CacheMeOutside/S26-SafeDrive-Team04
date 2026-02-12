import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isLoading) {
            auth.signinRedirect();
        }
    }, [auth, auth.isLoading, navigate]);

  return null;
}

export default LoginPage;