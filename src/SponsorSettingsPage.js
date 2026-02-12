import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useConversionRatio } from './ConversionRatioContext';
import { useNotifications } from './NotificationContext';

export default function SponsorSettingsPage() {
  const { ratio, setRatio, defaultRatio, convertPointsToDollars } = useConversionRatio();
  const { addNotification } = useNotifications();

  const [inputValue, setInputValue] = useState(ratio.toString());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError('');
    setSuccess('');

    const num = parseFloat(value);
    if (isNaN(num)) {
      setError('Please enter a valid number');
    } else if (num < 0.001) {
      setError('Ratio must be at least 0.001');
    } else if (num > 1.0) {
      setError('Ratio must not exceed 1.0');
    }
  };

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0.001 || num > 1.0) return;

    setRatio(num);
    setSuccess('Conversion ratio updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    setInputValue(defaultRatio.toString());
    setRatio(defaultRatio);
    setError('');
    setSuccess('Reset to default ratio');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleNotificationChange = (e) => {
    const value = e.target.value;
    setNotificationMessage(value);
    setNotificationError('');
    setNotificationSuccess('');
  };

  const handleSendNotification = () => {
    const message = notificationMessage.trim();

    if (!message) {
      setNotificationError('Notification message cannot be empty');
      return;
    }

    if (message.length < 3) {
      setNotificationError('Notification message must be at least 3 characters');
      return;
    }

    addNotification(message);
    setNotificationMessage('');
    setNotificationSuccess('Notification sent to all drivers successfully!');
    setTimeout(() => setNotificationSuccess(''), 3000);
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h2 className="mb-3">Sponsor Settings</h2>

      <Card style={{ padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h5>Point to Dollar Conversion Ratio</h5>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Set how many dollars each point is worth for drivers.
        </p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Dollars per Point</Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              min="0.001"
              max="1.0"
              value={inputValue}
              onChange={handleInputChange}
              isInvalid={!!error}
              placeholder="Enter value between 0.001 and 1.0"
            />
            <Form.Text className="text-muted">
              Enter value between 0.001 and 1.0 (e.g., 0.10 means 10 points = $1)
            </Form.Text>
            {error && <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>{error}</Form.Control.Feedback>}
          </Form.Group>

          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-3" style={{ padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5 }}>
            <strong>Preview:</strong>
            <ul style={{ marginTop: 10, marginBottom: 0 }}>
              <li>100 points = ${convertPointsToDollars(100).toFixed(2)}</li>
              <li>1000 points = ${convertPointsToDollars(1000).toFixed(2)}</li>
              <li>144 points = ${convertPointsToDollars(144).toFixed(2)}</li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!!error}
            className="me-2"
          >
            Save Changes
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
        </Form>
      </Card>

      <Card className="mt-4" style={{ padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h5>Send Notification to Drivers</h5>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Send important messages and announcements to all drivers.
        </p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Notification Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notificationMessage}
              onChange={handleNotificationChange}
              isInvalid={!!notificationError}
              placeholder="Enter a message to send to all drivers..."
            />
            <Form.Text className="text-muted">
              Enter a message with at least 3 characters
            </Form.Text>
            {notificationError && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                {notificationError}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {notificationSuccess && <Alert variant="success">{notificationSuccess}</Alert>}

          <Button
            variant="primary"
            onClick={handleSendNotification}
            disabled={!!notificationError}
          >
            Send Notification
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
