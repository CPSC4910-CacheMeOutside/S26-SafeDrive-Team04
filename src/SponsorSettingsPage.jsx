import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useConversionRatio } from './ConversionRatioContext';
import { useNotifications } from './NotificationContext';
import { useAuth } from 'react-oidc-context';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();
const DEFAULT_RATIO = 0.10;
import { useLanguage } from './LanguageContext';

export default function SponsorSettingsPage() {
  const { setRatio, convertPointsToDollars } = useConversionRatio();
  const { addNotification } = useNotifications();
  const auth = useAuth();
  const { t } = useLanguage();

  const sponsorId =
    auth?.user?.profile?.sub ||
    auth?.user?.profile?.username ||
    auth?.user?.profile?.email ||
    "";

  const [inputValue, setInputValue] = useState(DEFAULT_RATIO.toString());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  // Load ratio from DB on mount
  useEffect(() => {
    if (!sponsorId) return;
    (async () => {
      try {
        const result = await client.models.Sponsor.get({ sponsorId });
        const ratio = result?.data?.pointToDollarRatio ?? DEFAULT_RATIO;
        setInputValue(ratio.toString());
        setRatio(ratio);
      } catch (err) {
        console.error('Failed to load sponsor ratio:', err);
      }
    })();
  }, [sponsorId]);

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

  const handleSave = async () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0.001 || num > 1.0) return;

    try {
      setSaving(true);
      const existing = await client.models.Sponsor.get({ sponsorId });
      if (existing?.data) {
        await client.models.Sponsor.update({ sponsorId, pointToDollarRatio: num });
      } else {
        await client.models.Sponsor.create({ sponsorId, pointToDollarRatio: num });
      }
      setRatio(num);
      setSuccess('Conversion ratio updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save ratio:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setInputValue(DEFAULT_RATIO.toString());
    try {
      setSaving(true);
      const existing = await client.models.Sponsor.get({ sponsorId });
      if (existing?.data) {
        await client.models.Sponsor.update({ sponsorId, pointToDollarRatio: DEFAULT_RATIO });
      } else {
        await client.models.Sponsor.create({ sponsorId, pointToDollarRatio: DEFAULT_RATIO });
      }
      setRatio(DEFAULT_RATIO);
      setError('');
      setSuccess('Reset to default ratio');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to reset ratio:', err);
      setError('Failed to reset. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const previewRatio = parseFloat(inputValue) || DEFAULT_RATIO;

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
              <li>100 points = ${(100 * previewRatio).toFixed(2)}</li>
              <li>1000 points = ${(1000 * previewRatio).toFixed(2)}</li>
              <li>144 points = ${(144 * previewRatio).toFixed(2)}</li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!!error || saving}
            className="me-2"
          >
            {t('sponsorSettings.saveChanges')}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={saving}
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
