import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { usePoints } from '../PointsContext';
import { useConversionRatio } from '../ConversionRatioContext';
import { useLanguage } from './LanguageContext';

export default function SpendPointsModal({ show, onHide }) {
  const { getAllDrivers, getDriverPoints, spendPoints } = usePoints();
  const { convertPointsToDollars } = useConversionRatio();
  const { t } = useLanguage();

  const [selectedDriver, setSelectedDriver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const drivers = getAllDrivers();
  const currentPoints = selectedDriver ? getDriverPoints(selectedDriver) : 0;
  const dollarValue = amount ? convertPointsToDollars(parseFloat(amount) || 0) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedDriver) {
      setError(t('spendPoints.errSelectDriver'));
      return;
    }

    const pointsToSpend = parseFloat(amount);
    if (!pointsToSpend || pointsToSpend <= 0) {
      setError(t('spendPoints.errValidAmount'));
      return;
    }

    if (pointsToSpend > currentPoints) {
      setError(`${t('spendPoints.errExceedsBalancePrefix')} ${currentPoints} ${t('spendPoints.errExceedsBalanceSuffix')}`);
      return;
    }

    if (!description || description.trim().length < 3) {
      setError(t('spendPoints.errDescription'));
      return;
    }

    if (!sponsorName || sponsorName.trim().length === 0) {
      setError(t('spendPoints.errSponsorName'));
      return;
    }

    try {
      spendPoints(selectedDriver, pointsToSpend, description, sponsorName, dollarValue);
      setSuccess(`${t('spendPoints.successSpentPrefix')} ${pointsToSpend} ${t('spendPoints.successSpentMiddle')} ${selectedDriver}!`);

      // Reset form
      setAmount('');
      setDescription('');
      setSponsorName('');

      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess('');
        onHide();
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setSelectedDriver('');
    setAmount('');
    setDescription('');
    setSponsorName('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('spendPoints.title')}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Driver Selection */}
          <Form.Group className="mb-3">
            <Form.Label>{t('spendPoints.selectDriver')}</Form.Label>
            <Form.Select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
            >
              <option value="">{t('spendPoints.choosePlaceholder')}</option>
              {drivers.map(driver => (
                <option key={driver.alias} value={driver.alias}>
                  {driver.alias} ({driver.currentPoints} points)
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Current Points Display */}
          {selectedDriver && (
            <div style={{
              padding: 15,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: 20,
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{t('spendPoints.currentBalance')}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{currentPoints}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                ≈ ${convertPointsToDollars(currentPoints).toFixed(2)}
              </div>
            </div>
          )}

          {/* Points to Spend */}
          <Form.Group className="mb-3">
            <Form.Label>{t('spendPoints.pointsToSpend')}</Form.Label>
            <Form.Control
              type="number"
              placeholder={t('spendPoints.enterPointsPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
              disabled={!selectedDriver}
            />
            {amount && parseFloat(amount) > 0 && (
              <Form.Text className="text-muted">
                ≈ ${dollarValue.toFixed(2)}
              </Form.Text>
            )}
          </Form.Group>

          {/* Sponsor Name */}
          <Form.Group className="mb-3">
            <Form.Label>{t('spendPoints.sponsorName')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('spendPoints.enterSponsorPlaceholder')}
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              {t('spendPoints.sponsorOrgHint')}
            </Form.Text>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>{t('spendPoints.descriptionReason')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t('spendPoints.enterReasonPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={3}
            />
            <Form.Text className="text-muted">
              {t('spendPoints.minChars')}
            </Form.Text>
          </Form.Group>

          {/* Transaction Summary */}
          {selectedDriver && amount && parseFloat(amount) > 0 && description && sponsorName && (
            <div style={{
              padding: 15,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: '#e7f3ff',
              marginTop: 20
            }}>
              <h6>{t('spendPoints.transactionSummary')}</h6>
              <div><strong>{t('spendPoints.driverLabel')}</strong> {selectedDriver}</div>
              <div><strong>{t('spendPoints.pointsToSpendLabel')}</strong> {amount}</div>
              <div><strong>{t('spendPoints.dollarValue')}</strong> ${dollarValue.toFixed(2)}</div>
              <div><strong>{t('spendPoints.newBalance')}</strong> {currentPoints - parseFloat(amount)} {t('driver.points').replace(':', '')}</div>
              <div><strong>{t('spendPoints.sponsorLabel')}</strong> {sponsorName}</div>
              <div><strong>{t('spendPoints.reasonLabel')}</strong> {description}</div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('spendPoints.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!selectedDriver || !amount || !description || !sponsorName}
          >
            {t('spendPoints.confirmSpend')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
