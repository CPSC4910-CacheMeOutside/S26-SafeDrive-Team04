import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { usePoints } from '../PointsContext';
import { useConversionRatio } from '../ConversionRatioContext';

export default function SpendPointsModal({ show, onHide }) {
  const { getAllDrivers, getDriverPoints, spendPoints } = usePoints();
  const { convertPointsToDollars } = useConversionRatio();

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
      setError('Please select a driver');
      return;
    }

    const pointsToSpend = parseFloat(amount);
    if (!pointsToSpend || pointsToSpend <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    if (pointsToSpend > currentPoints) {
      setError(`Cannot spend more than ${currentPoints} points (driver's current balance)`);
      return;
    }

    if (!description || description.trim().length < 3) {
      setError('Please enter a description (minimum 3 characters)');
      return;
    }

    if (!sponsorName || sponsorName.trim().length === 0) {
      setError('Please enter sponsor name');
      return;
    }

    try {
      spendPoints(selectedDriver, pointsToSpend, description, sponsorName, dollarValue);
      setSuccess(`Successfully spent ${pointsToSpend} points for ${selectedDriver}!`);

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
        <Modal.Title>Spend Driver Points</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Driver Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Select Driver</Form.Label>
            <Form.Select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
            >
              <option value="">Choose a driver...</option>
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
              <div style={{ fontSize: 14, opacity: 0.7 }}>Current Points Balance</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{currentPoints}</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>
                ≈ ${convertPointsToDollars(currentPoints).toFixed(2)}
              </div>
            </div>
          )}

          {/* Points to Spend */}
          <Form.Group className="mb-3">
            <Form.Label>Points to Spend</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter points amount"
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
            <Form.Label>Sponsor Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter sponsor organization name"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              The organization spending these points
            </Form.Text>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description/Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason for spending points (e.g., Gas card redemption, Reward program)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={3}
            />
            <Form.Text className="text-muted">
              Minimum 3 characters
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
              <h6>Transaction Summary</h6>
              <div><strong>Driver:</strong> {selectedDriver}</div>
              <div><strong>Points to Spend:</strong> {amount}</div>
              <div><strong>Dollar Value:</strong> ${dollarValue.toFixed(2)}</div>
              <div><strong>New Balance:</strong> {currentPoints - parseFloat(amount)} points</div>
              <div><strong>Sponsor:</strong> {sponsorName}</div>
              <div><strong>Reason:</strong> {description}</div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!selectedDriver || !amount || !description || !sponsorName}
          >
            Confirm Spend
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
