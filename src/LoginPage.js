import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated && auth.user) {
            const groups = auth.user?.profile?.["cognito:groups"];

            if (groups?.includes("Sponsor")) {
                navigate("/SponsorPage", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
            return;
        }

        if (window.location.search.includes("code=") || window.location.hash.includes("id_token")) {
            auth.signinRedirectCallback().then(() => {
                const groups = auth.user?.profile?.["cognito:groups"];

                if (groups?.includes("Sponsor")) {
                    navigate("/SponsorPage", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            });
            return;
        }

        if (!auth.isLoading) {
            auth.signinRedirect();
        }
    }, [auth, auth.isAuthenticated, auth.user, navigate]);

  return null;
}

export default LoginPage;