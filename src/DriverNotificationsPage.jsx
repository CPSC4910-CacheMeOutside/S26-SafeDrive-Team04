import { Container, Card, Button, ListGroup } from 'react-bootstrap';
import { useNotifications } from './NotificationContext';

// Page for drivers to view their active notifications and dismiss them
export default function DriverNotificationsPage() {
  const { getActiveNotifications, closeNotification } = useNotifications();

  const activeNotifications = getActiveNotifications();

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-1">Your Notifications</h2>
      <p className="text-muted mb-4">
        Messages from your sponsor. You can dismiss a notification once you have read it.
      </p>

      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          {activeNotifications.length === 0 ? (
            // Empty state shown when all notifications have been dismissed
            <div className="text-center py-4 text-muted">
              <p className="mb-0">You have no new notifications.</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {/* Show most recent notifications first */}
              {[...activeNotifications].reverse().map(n => (
                <ListGroup.Item
                  key={n.id}
                  className="d-flex justify-content-between align-items-start py-3"
                >
                  <div>
                    <p className="mb-1">{n.description}</p>
                    <small className="text-muted">
                      {new Date(n.timestamp).toLocaleString()}
                    </small>
                  </div>
                  {/* Dismiss marks this notification as closed in localStorage */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="ms-3 align-self-center"
                    onClick={() => closeNotification(n.id)}
                  >
                    Dismiss
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
