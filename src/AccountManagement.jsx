import { CognitoIdentityProviderClient, DeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { useLanguage } from './LanguageContext';

export default function AccountManagement() {
  const { t } = useLanguage();
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
      <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
      <h1><strong>{t('accountManagement.title')}</strong></h1>

      <Form className="mt-5">
        <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
          <Form.Group as={Row} className="mb-3 align-items-center">
            <Form.Label column sm={3}>
              {t('accountManagement.deleteAccount')}
            </Form.Label>

            <Col sm={6}>
              <Button variant="danger" onClick={handleDeleteAccount}>
                {t('accountManagement.deleteButton')}
              </Button>
            </Col>
          </Form.Group>
        </div>
      </Form>
      </div>
    </Container>
  );
}