import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useConversionRatio } from './ConversionRatioContext';
import { useNotifications } from './NotificationContext';
import { useLanguage } from './LanguageContext';

export default function SponsorSettingsPage() {
  const { ratio, setRatio, defaultRatio, convertPointsToDollars } = useConversionRatio();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();

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
      setError(t('sponsorSettings.errInvalidNum'));
    } else if (num < 0.001) {
      setError(t('sponsorSettings.errMinRatio'));
    } else if (num > 1.0) {
      setError(t('sponsorSettings.errMaxRatio'));
    }
  };

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0.001 || num > 1.0) return;

    setRatio(num);
    setSuccess(t('sponsorSettings.successRatio'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    setInputValue(defaultRatio.toString());
    setRatio(defaultRatio);
    setError('');
    setSuccess(t('sponsorSettings.successReset'));
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
      setNotificationError(t('sponsorSettings.errEmpty'));
      return;
    }

    if (message.length < 3) {
      setNotificationError(t('sponsorSettings.errMinChars'));
      return;
    }

    addNotification(message);
    setNotificationMessage('');
    setNotificationSuccess(t('sponsorSettings.successNotif'));
    setTimeout(() => setNotificationSuccess(''), 3000);
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h2 className="mb-3">{t('sponsorSettings.title')}</h2>

      <Card style={{ padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h5>{t('sponsorSettings.conversionTitle')}</h5>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          {t('sponsorSettings.conversionDesc')}
        </p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('sponsorSettings.dollarsPerPoint')}</Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              min="0.001"
              max="1.0"
              value={inputValue}
              onChange={handleInputChange}
              isInvalid={!!error}
              placeholder={t('sponsorSettings.valuePlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('sponsorSettings.valueHint')}
            </Form.Text>
            {error && <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>{error}</Form.Control.Feedback>}
          </Form.Group>

          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-3" style={{ padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5 }}>
            <strong>{t('sponsorSettings.preview')}</strong>
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
            {t('sponsorSettings.saveChanges')}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            {t('sponsorSettings.resetToDefault')}
          </Button>
        </Form>
      </Card>

      <Card className="mt-4" style={{ padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h5>{t('sponsorSettings.notifTitle')}</h5>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          {t('sponsorSettings.notifDesc')}
        </p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('sponsorSettings.notifMessage')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notificationMessage}
              onChange={handleNotificationChange}
              isInvalid={!!notificationError}
              placeholder={t('sponsorSettings.notifPlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('sponsorSettings.notifHint')}
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
            {t('sponsorSettings.sendButton')}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
