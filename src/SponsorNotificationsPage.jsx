import { Container, Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useState } from 'react';
import { useNotifications } from './NotificationContext';

// Page for sponsors to compose and send notifications to drivers
export default function SponsorNotificationsPage() {
  const { notifications, addNotification } = useNotifications();

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
      setMessageError('Notification message cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setMessageError('Notification message must be at least 3 characters.');
      return;
    }

    addNotification(trimmed);
    setMessage('');
    setMessageSuccess('Notification sent to drivers successfully!');
    setTimeout(() => setMessageSuccess(''), 3000);
  };

  // Count how many sent notifications are still active (not dismissed by driver)
  const activeCount = notifications.filter(n => !n.closed).length;
  const totalCount = notifications.length;

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-1">Send Notifications</h2>
      <p className="text-muted mb-4">Compose a message and send it to all drivers.</p>

      {/* Compose and send a new notification */}
      <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <Card.Title>New Notification</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={message}
                onChange={handleMessageChange}
                isInvalid={!!messageError}
                placeholder="Write your message to drivers here..."
              />
              <Form.Text className="text-muted">Minimum 3 characters.</Form.Text>
              {messageError && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {messageError}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {messageSuccess && <Alert variant="success">{messageSuccess}</Alert>}

            <Button variant="primary" onClick={handleSend} disabled={!!messageError}>
              Send Notification
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* History of all sent notifications */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0">Sent Notifications</Card.Title>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {activeCount} active / {totalCount} total
            </span>
          </div>

          {totalCount === 0 ? (
            <p className="text-muted">No notifications sent yet.</p>
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
                    {n.closed ? 'Dismissed' : 'Active'}
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
