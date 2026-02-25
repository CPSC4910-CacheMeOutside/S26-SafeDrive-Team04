import { CognitoIdentityProviderClient, DeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { useAuth } from 'react-oidc-context';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';

export default function AccountManagement() {
  const auth = useAuth();

  const deleteUser = async ({ region, accessToken }) => {
    const client = new CognitoIdentityProviderClient({ region });
    return client.send(new DeleteUserCommand({ AccessToken: accessToken }));
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("WARNING: Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    const accessToken = auth.user?.access_token;

    try {
      await deleteUser({ region: "us-east-1", accessToken });

      await auth.removeUser();
      window.location.assign("/");

      alert("Your account has been successfully deleted.");
    } catch (e) {
      console.error(e);
      alert("Failed to delete account.");
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
        <h1><strong>Account Settings</strong></h1>

        <Form className="mt-5">
          <Form.Group as={Row} className="mb-3 align-items-center">
            <Form.Label column sm={"auto"} className="mb-0 text-nowrap">Delete Account:</Form.Label>
              <Col sm={"auto"} className="d-flex align-items-center">
                <Button variant="danger" onClick={handleDeleteAccount}>DELETE MY ACCOUNT</Button>
              </Col>
          </Form.Group>
        </Form>
      </div>
    </Container>
  );
}