'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import { useReports } from '../context/ReportsContext';
import { ReportsProvider } from '../context/ReportsContext';

function HomePageContent() {
  const { reports, moveReport } = useReports();
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [invalidDropStatus, setInvalidDropStatus] = useState(null);

  const isValidMove = (fromStatus, toStatus) => {
    const validMoves = {
      'new': ['inProgress'],
      'inProgress': ['readyForPickup'],
      'readyForPickup': ['completed'],
      'completed': []
    };
    return validMoves[fromStatus]?.includes(toStatus) || false;
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    const data = e.dataTransfer.types.includes('application/json') 
      ? JSON.parse(e.dataTransfer.getData('application/json'))
      : null;
    
    if (data) {
      if (data.fromStatus === status) {
        setDragOverStatus(null);
        setInvalidDropStatus(null);
      } else if (isValidMove(data.fromStatus, status)) {
        setDragOverStatus(status);
        setInvalidDropStatus(null);
      } else {
        setInvalidDropStatus(status);
        setDragOverStatus(null);
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
    setInvalidDropStatus(null);
  };

  const handleDrop = (e, toStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setInvalidDropStatus(null);
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (isValidMove(data.fromStatus, toStatus)) {
      moveReport(data.reportId, data.fromStatus, toStatus);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <section className={styles.reportsSection}>
          <h2>Zgłoszenia lokalne</h2>
          <div className={styles.reportsGrid}>
            <div 
              className={`${styles.statusColumn} ${styles.newReports} 
                ${dragOverStatus === 'new' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'new' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'new')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'new')}
            >
              <h3>Nowe zgłoszenia</h3>
              {reports.new.map(report => (
                <ReportCard key={report.id} report={report} status="new" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.inProgress} 
                ${dragOverStatus === 'inProgress' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'inProgress' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'inProgress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'inProgress')}
            >
              <h3>W trakcie realizacji</h3>
              {reports.inProgress.map(report => (
                <ReportCard key={report.id} report={report} status="inProgress" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.readyForPickup} 
                ${dragOverStatus === 'readyForPickup' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'readyForPickup' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'readyForPickup')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'readyForPickup')}
            >
              <h3>Gotowe do odbioru</h3>
              {reports.readyForPickup.map(report => (
                <ReportCard key={report.id} report={report} status="readyForPickup" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.completed} 
                ${dragOverStatus === 'completed' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'completed' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'completed')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'completed')}
            >
              <h3>Odebrane</h3>
              {reports.completed.map(report => (
                <ReportCard key={report.id} report={report} status="completed" />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.reportsSection}>
          <h2>Zgłoszenia online</h2>
          <div className={styles.reportsGrid}>
            <div className={styles.reportCard}>
              <h3>Zgłoszenie #5</h3>
              <p>Status: Nowe</p>
              <p>Klient: Tomasz Lewandowski</p>
              <p>Data: 2024-03-20</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ReportsProvider>
      <HomePageContent />
    </ReportsProvider>
  );
} 