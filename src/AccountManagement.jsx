import { CognitoIdentityProviderClient, DeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { useFontSize } from './FontSizeContext';

import { useLanguage } from './LanguageContext';

export default function AccountManagement() {
  const { t } = useLanguage();
  const { fontSize, cycleFontSize } = useFontSize();
  const deleteUser = async ({ region, accessToken }) => {
    const client = new CognitoIdentityProviderClient({ region });
    return client.send(new DeleteUserCommand({ AccessToken: accessToken }));
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('accountManagement.confirmDelete'));
    if (!confirmed) return;

    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error('No access token found.');
      }

      await deleteUser({ region: 'us-east-1', accessToken });
      await signOut();

      alert(t('accountManagement.deleteSuccess'));
      window.location.assign('/');
    } catch (e) {
      console.error(e);
      alert(t('accountManagement.deleteFailed'));
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
      <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>Account Settings</h1>
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>

      <Form className="mt-5">
          <Form.Group as={Row} className="mb-3 align-items-center">
            <Form.Label column sm={3}><strong>Adjust Text Size:</strong></Form.Label>
            <Col sm={6}>
              <Button
                style={{ width: "180px", height: "50px" }}
                variant="outline-secondary"
                size="sm"
                onClick={cycleFontSize}
                aria-label={`Text size ${fontSize}%. Click to increase.`}
                className="me-2">
                  A {fontSize}%
              </Button>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mt-5 align-items-center">
            <Form.Label column sm={3}><strong>Delete Account:</strong></Form.Label>
            <Col sm={6}>
              <Button style={{ padding: "10px 16px", fontSize: "inherit" }} variant="danger" onClick={handleDeleteAccount}>
                DELETE MY ACCOUNT
              </Button>
            </Col>
          </Form.Group>
      </Form>
      </div>
      </div>
    </Container>
  );
}