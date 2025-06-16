'use client';

import { createContext, useContext, useState } from 'react';

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState({
    new: [
      { id: 1, title: 'Zgłoszenie #1', client: 'Jan Kowalski', date: '2024-03-20' },
    ],
    inProgress: [
      { id: 2, title: 'Zgłoszenie #2', client: 'Anna Nowak', date: '2024-03-19' },
    ],
    readyForPickup: [
      { id: 3, title: 'Zgłoszenie #3', client: 'Piotr Wiśniewski', date: '2024-03-18' },
    ],
    completed: [
      { id: 4, title: 'Zgłoszenie #4', client: 'Maria Kowalczyk', date: '2024-03-17' },
    ],
  });

  const moveReport = (reportId, fromStatus, toStatus) => {
    setReports(prevReports => {
      const report = prevReports[fromStatus].find(r => r.id === reportId);
      if (!report) return prevReports;

      return {
        ...prevReports,
        [fromStatus]: prevReports[fromStatus].filter(r => r.id !== reportId),
        [toStatus]: [...prevReports[toStatus], report],
      };
    });
  };

  return (
    <ReportsContext.Provider value={{ reports, moveReport }}>
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