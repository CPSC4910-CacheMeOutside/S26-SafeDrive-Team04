import { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, ListGroup } from 'react-bootstrap';
import { useNotifications } from './NotificationContext';

export default function DriverNotificationsPage() {
  const { getActiveNotifications, closeNotification, toggleStar, togglePin } = useNotifications();

  const activeNotifications = getActiveNotifications();

  const [starredOrder, setStarredOrder] = useState(() => {
    const stored = localStorage.getItem('safedrive_starred_order');
    return stored ? JSON.parse(stored) : [];
  });

  const dragItemId = useRef(null);

  useEffect(() => {
    const starredIds = activeNotifications
      .filter(n => n.starred && !n.pinned)
      .map(n => n.id);

    const kept = starredOrder.filter(id => starredIds.includes(id));
    const added = starredIds.filter(id => !starredOrder.includes(id));

    if (kept.length !== starredOrder.length || added.length > 0) {
      const next = [...kept, ...added];
      setStarredOrder(next);
      localStorage.setItem('safedrive_starred_order', JSON.stringify(next));
    }
  }, [activeNotifications]);


  const pinnedNotification = activeNotifications.find(n => n.pinned) ?? null;

  const starredById = Object.fromEntries(
    activeNotifications.filter(n => n.starred && !n.pinned).map(n => [n.id, n])
  );
  const orderedStarred = starredOrder
    .filter(id => starredById[id])
    .map(id => starredById[id]);

  const regularNotifications = activeNotifications
    .filter(n => !n.starred && !n.pinned)
    .sort((a, b) => b.timestamp - a.timestamp);

  const hasNoNotifications =
    !pinnedNotification && orderedStarred.length === 0 && regularNotifications.length === 0;


  const handleDragStart = (id) => {
    dragItemId.current = id;
  };

  const handleDrop = (targetId) => {
    if (!dragItemId.current || dragItemId.current === targetId) return;
    const next = [...starredOrder];
    const from = next.indexOf(dragItemId.current);
    const to   = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragItemId.current);
    setStarredOrder(next);
    localStorage.setItem('safedrive_starred_order', JSON.stringify(next));
  };

  const handleDragEnd = () => {
    dragItemId.current = null;
  };

  const iconBtnStyle = (active, activeColor) => ({
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: 16,
    color: active ? activeColor : '#aaa',
    marginTop: 4,
    marginRight: 8
  });


  const renderItem = (n, { draggable = false, bgColor = undefined } = {}) => (
    <ListGroup.Item
      key={n.id}
      className="d-flex justify-content-between align-items-start py-3"
      style={{ backgroundColor: bgColor }}
      draggable={draggable}
      onDragStart={draggable ? () => handleDragStart(n.id) : undefined}
      onDragOver={draggable ? (e) => e.preventDefault() : undefined}
      onDrop={draggable ? () => handleDrop(n.id) : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <div>
        <p className="mb-1">{n.description}</p>
        <small className="text-muted">
          {new Date(n.timestamp).toLocaleString()}
        </small>

        <div className="d-flex mt-1">
          <button
            onClick={() => togglePin(n.id)}
            style={iconBtnStyle(n.pinned, '#e63946')}
            aria-label={n.pinned ? 'Unpin notification' : 'Pin notification'}
            title={n.pinned ? 'Unpin' : 'Pin to top'}
          >
            {n.pinned ? '📌' : '📍'}
          </button>

          <button
            onClick={() => toggleStar(n.id)}
            style={iconBtnStyle(n.starred, '#f5c518')}
            aria-label={n.starred ? 'Unstar notification' : 'Star notification'}
          >
            {n.starred ? '★' : '☆'}
          </button>
        </div>
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
  );

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-1">Your Notifications</h2>
      <p className="text-muted mb-4">
        Messages from your sponsor. You can dismiss a notification once you have read it.
      </p>

      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          {hasNoNotifications ? (
            // Empty state shown when all notifications have been dismissed
            <div className="text-center py-4 text-muted">
              <p className="mb-0">You have no new notifications.</p>
            </div>
          ) : (
            <ListGroup variant="flush">

              {pinnedNotification && (
                <>
                  <ListGroup.Item className="py-1 px-3" style={{ backgroundColor: '#fffbea', borderBottom: 'none' }}>
                    <small className="text-muted fw-semibold">📌 Pinned</small>
                  </ListGroup.Item>
                  {renderItem(pinnedNotification, { bgColor: '#fffbea' })}
                </>
              )}

              {orderedStarred.map(n => renderItem(n, { draggable: true }))}

              {regularNotifications.length > 0 && orderedStarred.length > 0 && (
                <ListGroup.Item className="py-1 px-3" style={{ borderBottom: 'none' }}>
                  <small className="text-muted fw-semibold">Recent</small>
                </ListGroup.Item>
              )}
              {regularNotifications.map(n => renderItem(n))}

            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
