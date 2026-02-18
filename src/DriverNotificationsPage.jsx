import { Container, Card, Button, ListGroup } from 'react-bootstrap';
import { useNotifications } from './NotificationContext';

// Page for drivers to view their active notifications and dismiss them
export default function DriverNotificationsPage() {
  const { getActiveNotifications, closeNotification, toggleStar } = useNotifications();

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
              {/*
                Added a sort so that starred notifications appear at the top above new unstarred ones.
                Then after the starred notifications they are in order of most recent to oldest.
              */}
              {[...activeNotifications].sort((a, b) => {
                if (a.starred !== b.starred) return a.starred ? -1 : 1; // starred items first
                return b.timestamp - a.timestamp;                        // then newest first
              }).map(n => (
                <ListGroup.Item
                  key={n.id}
                  className="d-flex justify-content-between align-items-start py-3"
                >
                  <div>
                    <p className="mb-1">{n.description}</p>
                    <small className="text-muted">
                      {new Date(n.timestamp).toLocaleString()}
                    </small>
                    {/*
                      This is the star button that is able to be toggled on and off.
                      The star is hollowed out when not starred and is filled when starred.
                    */}
                    <button
                      onClick={() => toggleStar(n.id)}
                      style={{
                        display: 'block',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: 16,
                        color: n.starred ? '#f5c518' : '#aaa',
                        marginTop: 4
                      }}
                      aria-label={n.starred ? 'Unstar notification' : 'Star notification'}
                    >
                      {n.starred ? '★' : '☆'}
                    </button>
                  </div>
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
