'use client';

import { createContext, useContext, useState } from 'react';
import { exportReportsToCSV, importReportsFromCSV } from '../utils/csvUtils';

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState({
    new: [],
    inProgress: [],
    readyForPickup: [],
    completed: [],
    cancelled: [],
    online_new: [],
    online_approved: [],
    online_in_transport: [],
    online_in_progress: [],
    online_ready_to_ship: [],
    online_shipped: [],
    online_delivered: [],
    online_rejected: []
  });

  const moveReport = (reportId, fromStatus, toStatus) => {
    setReports(prevReports => {
      const report = prevReports[fromStatus].find(r => r.id === reportId);
      if (!report) return prevReports;

      return {
        ...prevReports,
        [fromStatus]: prevReports[fromStatus].filter(r => r.id !== reportId),
        [toStatus]: [...prevReports[toStatus], report]
      };
    });
  };

  const handleExportToCSV = () => {
    exportReportsToCSV(reports);
  };

  const handleImportFromCSV = async (file) => {
    try {
      const importedReports = await importReportsFromCSV(file);
      setReports(importedReports);
      return true;
    } catch (error) {
      console.error('Error importing CSV:', error);
      return false;
    }
  };

  return (
    <ReportsContext.Provider value={{ 
      reports, 
      moveReport, 
      handleExportToCSV, 
      handleImportFromCSV 
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
} 