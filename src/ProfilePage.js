import { Container, Button } from 'react-bootstrap';
import { useNotifications } from './NotificationContext';
import { usePoints } from './PointsContext';

export default function ProfilePage(){
  const alias = "Breaker_1-9";
  const { getDriverPoints } = usePoints();
  const points = getDriverPoints(alias);

  const { getActiveNotifications, closeNotification } = useNotifications();
  const activeNotifications = getActiveNotifications().sort((a, b) => b.timestamp - a.timestamp);

  const handleCloseNotification = (id) => {
    closeNotification(id);
  };
  return(
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 classname="mb-3">Driver Profile</h2>

      <div style={{
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h4>{alias}</h4>
        <div style={{ fontsize: 14, opacity: 0.7}}>Current Points</div>
        <div style={{ fontsize: 40, fontweight: 700}}>{points}</div>
      </div>

      <h4 className="mt-4 mb-3">Notifications</h4>
      {activeNotifications.length === 0 ? (
        <div style={{
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: 'center',
          opacity: 0.7
        }}>
          No new notifications
        </div>
      ) : (
        activeNotifications.map(notification => (
          <div
            key={notification.id}
            className="mb-3"
            style={{
              padding: 20,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
                <p style={{ margin: 0 }}>{notification.description}</p>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleCloseNotification(notification.id)}
                style={{ marginLeft: 15 }}
              >
                Close
              </Button>
            </div>
          </div>
        ))
      )}

    </Container>
  );
}