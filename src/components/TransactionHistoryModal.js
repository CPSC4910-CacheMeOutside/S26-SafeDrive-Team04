import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { usePoints } from '../PointsContext';
import { useConversionRatio } from '../ConversionRatioContext';

export default function TransactionHistoryModal({ show, onHide, driverAlias }) {
  const { getDriverPoints, getDriverTransactions } = usePoints();
  const { convertPointsToDollars } = useConversionRatio();

  const currentPoints = getDriverPoints(driverAlias);
  const transactions = getDriverTransactions(driverAlias);

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Your Transaction History</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Current Points Display */}
        <div style={{
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Current Points</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{currentPoints}</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>
            ≈ ${convertPointsToDollars(currentPoints).toFixed(2)}
          </div>
        </div>

        {/* Transactions List */}
        <h5 className="mb-3">Transaction History</h5>
        {sortedTransactions.length === 0 ? (
          <div style={{
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: 'center',
            opacity: 0.7
          }}>
            No transactions yet
          </div>
        ) : (
          sortedTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="mb-3"
              style={{
                padding: 20,
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  {/* Date/Time */}
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </div>

                  {/* Description */}
                  <p style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                    {transaction.description}
                  </p>

                  {/* Performed By */}
                  <div style={{ fontSize: 14, opacity: 0.7 }}>
                    by {transaction.performedBy}
                  </div>
                </div>

                <div style={{ marginLeft: 15, textAlign: 'right' }}>
                  {/* Amount with color coding */}
                  <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: transaction.amount >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                  </div>

                  {/* Dollar value */}
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {transaction.amount >= 0 ? '+' : ''}${convertPointsToDollars(Math.abs(transaction.amount)).toFixed(2)}
                  </div>

                  {/* New balance */}
                  <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
                    Balance: {transaction.balance}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
