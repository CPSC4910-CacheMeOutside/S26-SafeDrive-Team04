import { CognitoIdentityProviderClient, DeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';

export default function AccountManagement() {
  const deleteUser = async ({ region, accessToken }) => {
    const client = new CognitoIdentityProviderClient({ region });
    return client.send(new DeleteUserCommand({ AccessToken: accessToken }));
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error('No access token found.');
      }

      await deleteUser({ region: 'us-east-1', accessToken });
      await signOut();

      alert('Your account has been successfully deleted.');
      window.location.assign('/');
    } catch (e) {
      console.error(e);
      alert('Failed to delete account.');
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
      <h1><strong>Account Settings</strong></h1>

      <Form className="mt-5">
        <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
          <Form.Group as={Row} className="mb-3 align-items-center">
            <Form.Label column sm={3}>
              Delete Account:
            </Form.Label>

            <Col sm={6}>
              <Button variant="danger" onClick={handleDeleteAccount}>
                DELETE MY ACCOUNT
              </Button>
            </Col>
          </Form.Group>
        </div>
      </Form>
      </div>
    </Container>
  );
}