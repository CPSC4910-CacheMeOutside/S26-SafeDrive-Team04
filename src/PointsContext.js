import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();
const STORAGE_KEY = 'safedrive_points_data';

export function PointsProvider({ children }) {
  const [pointsData, setPointsData] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize with default driver "Breaker_1-9" with 144 points
    return {
      drivers: {
        "Breaker_1-9": {
          alias: "Breaker_1-9",
          currentPoints: 144,
          transactions: [
            {
              id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
              type: "initial",
              amount: 144,
              balance: 144,
              description: "Initial points balance",
              performedBy: "System",
              dollarValue: 0
            }
          ]
        }
      }
    };
  });

  const saveData = (data) => {
    setPointsData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getDriverPoints = (driverAlias) => {
    return pointsData.drivers[driverAlias]?.currentPoints || 0;
  };

  const getDriverTransactions = (driverAlias) => {
    return pointsData.drivers[driverAlias]?.transactions || [];
  };

  const getAllDrivers = () => {
    return Object.keys(pointsData.drivers).map(alias => ({
      alias,
      currentPoints: pointsData.drivers[alias].currentPoints
    }));
  };

  const spendPoints = (driverAlias, amount, description, sponsorName, dollarValue) => {
    const driver = pointsData.drivers[driverAlias];
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (amount > driver.currentPoints) {
      throw new Error('Insufficient points');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const newBalance = driver.currentPoints - amount;
    const newTransaction = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: "sponsor_spend",
      amount: -amount,  // negative for spending
      balance: newBalance,
      description: description.trim(),
      performedBy: sponsorName.trim(),
      dollarValue: dollarValue || 0
    };

    const updatedData = {
      ...pointsData,
      drivers: {
        ...pointsData.drivers,
        [driverAlias]: {
          ...driver,
          currentPoints: newBalance,
          transactions: [...driver.transactions, newTransaction]
        }
      }
    };

    saveData(updatedData);
    return newTransaction;
  };

  const addPoints = (driverAlias, amount, description, reason) => {
    const driver = pointsData.drivers[driverAlias];
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const newBalance = driver.currentPoints + amount;
    const newTransaction = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: "admin_add",
      amount: amount,  // positive for adding
      balance: newBalance,
      description: description.trim(),
      performedBy: "Admin",
      metadata: { reason: reason || '' }
    };

    const updatedData = {
      ...pointsData,
      drivers: {
        ...pointsData.drivers,
        [driverAlias]: {
          ...driver,
          currentPoints: newBalance,
          transactions: [...driver.transactions, newTransaction]
        }
      }
    };

    saveData(updatedData);
    return newTransaction;
  };

  const value = {
    getDriverPoints,
    getDriverTransactions,
    getAllDrivers,
    spendPoints,
    addPoints
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within PointsProvider');
  }
  return context;
}
