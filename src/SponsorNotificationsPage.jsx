import { Container, Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { useLanguage } from './LanguageContext';

// Page for sponsors to compose and send notifications to drivers
export default function SponsorNotificationsPage() {
  const { notifications, addNotification } = useNotifications();
  const { t } = useLanguage();

  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageSuccess, setMessageSuccess] = useState('');

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setMessageError('');
    setMessageSuccess('');
  };

  const handleSend = () => {
    const trimmed = message.trim();

    if (!trimmed) {
      setMessageError(t('sponsorNotif.emptyError'));
      return;
    }
    if (trimmed.length < 3) {
      setMessageError(t('sponsorNotif.minCharsError'));
      return;
    }

    addNotification(trimmed);
    setMessage('');
    setMessageSuccess(t('sponsorNotif.sentSuccess'));
    setTimeout(() => setMessageSuccess(''), 3000);
  };

  // Count how many sent notifications are still active (not dismissed by driver)
  const activeCount = notifications.filter(n => !n.closed).length;
  const totalCount = notifications.length;

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-1">{t('sponsorNotif.title')}</h2>
      <p className="text-muted mb-4">{t('sponsorNotif.subtitle')}</p>

      {/* Compose and send a new notification */}
      <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <Card.Title>{t('sponsorNotif.newNotification')}</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('sponsorNotif.message')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={message}
                onChange={handleMessageChange}
                isInvalid={!!messageError}
                placeholder={t('sponsorNotif.messagePlaceholder')}
              />
              <Form.Text className="text-muted">{t('sponsorNotif.minChars')}</Form.Text>
              {messageError && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {messageError}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {messageSuccess && <Alert variant="success">{messageSuccess}</Alert>}

            <Button variant="primary" onClick={handleSend} disabled={!!messageError}>
              {t('sponsorNotif.sendNotification')}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* History of all sent notifications */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0">{t('sponsorNotif.sentNotifications')}</Card.Title>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {activeCount} active / {totalCount} total
            </span>
          </div>

          {totalCount === 0 ? (
            <p className="text-muted">{t('sponsorNotif.noSent')}</p>
          ) : (
            <ListGroup variant="flush">
              {/* Show most recent first */}
              {[...notifications].reverse().map(n => (
                <ListGroup.Item key={n.id} className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1">{n.description}</p>
                    <small className="text-muted">
                      {new Date(n.timestamp).toLocaleString()}
                    </small>
                  </div>
                  {/* Show whether the driver has dismissed this notification */}
                  <Badge bg={n.closed ? 'secondary' : 'success'} className="ms-3 align-self-center">
                    {n.closed ? t('sponsorNotif.dismissed') : t('sponsorNotif.active')}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
