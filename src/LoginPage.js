import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useAuth } from 'react-oidc-context';

function LoginPage() {
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = "5qkcg4h6o51nq40der98l7qsvk";
        const logoutUri = "https://us-east-17kwyoumwk.auth.us-east-1.amazoncognito.com/login?client_id=5qkcg4h6o51nq40der98l7qsvk&code_challenge=BUerzAg2I92sPPfdB0DRSKun7_rYf8bV6zGBpUdL6do&code_challenge_method=S256&redirect_uri=https://main.d34ak230g49yud.amplifyapp.com/&response_type=code&scope=phone+openid+email&state=e545a2f8b6b2483882364088482fb7a1";
        const cognitoDomain = "https://us-east-17kwyoumwk.auth.us-east-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
        <div>
            <pre> Hello: {auth.user?.profile.email} </pre>
            <pre> ID Token: {auth.user?.id_token} </pre>
            <pre> Access Token: {auth.user?.access_token} </pre>
            <pre> Refresh Token: {auth.user?.refresh_token} </pre>

            <button onClick={() => auth.removeUser()}>Sign out</button>
        </div>
        );
    }

    return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default LoginPage;