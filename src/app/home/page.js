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
    // Don't allow moving to the same column
    if (fromStatus === toStatus) return false;

    // Check if both statuses are from the same section (local or online)
    const isFromLocal = !fromStatus.startsWith('online_');
    const isToLocal = !toStatus.startsWith('online_');

    // Only allow moves within the same section
    return isFromLocal === isToLocal;
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
          <div className={`${styles.reportsGrid} ${styles.localReportsGrid}`}>
            <div
              className={`${styles.statusColumn} ${styles.newReports} ${
                dragOverStatus === 'new' ? styles.dragOver : ''
              } ${invalidDropStatus === 'new' ? styles.invalidDrop : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-status="new"
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

            <div 
              className={`${styles.statusColumn} ${styles.cancelled} 
                ${dragOverStatus === 'cancelled' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'cancelled' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'cancelled')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'cancelled')}
            >
              <h3>Zgłoszenia odrzucone</h3>
              {reports.cancelled?.map(report => (
                <ReportCard key={report.id} report={report} status="cancelled" />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.reportsSection}>
          <h2>Zgłoszenia online</h2>
          <div className={`${styles.reportsGrid} ${styles.onlineReportsGrid}`}>
            <div
              className={`${styles.statusColumn} ${styles.newReports} ${
                dragOverStatus === 'online_new' ? styles.dragOver : ''
              } ${invalidDropStatus === 'online_new' ? styles.invalidDrop : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-status="online_new"
            >
              <h3>Nowe zgłoszenia</h3>
              {reports.online_new?.map(report => (
                <ReportCard key={report.id} report={report} status="online_new" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.approved} 
                ${dragOverStatus === 'online_approved' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_approved' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_approved')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_approved')}
            >
              <h3>Zgłoszenia zatwierdzone</h3>
              {reports.online_approved?.map(report => (
                <ReportCard key={report.id} report={report} status="online_approved" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.inTransport} 
                ${dragOverStatus === 'online_in_transport' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_in_transport' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_in_transport')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_in_transport')}
            >
              <h3>W trakcie transportu</h3>
              {reports.online_in_transport?.map(report => (
                <ReportCard key={report.id} report={report} status="online_in_transport" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.inProgress} 
                ${dragOverStatus === 'online_in_progress' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_in_progress' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_in_progress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_in_progress')}
            >
              <h3>W trakcie realizacji</h3>
              {reports.online_in_progress?.map(report => (
                <ReportCard key={report.id} report={report} status="online_in_progress" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.readyToShip} 
                ${dragOverStatus === 'online_ready_to_ship' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_ready_to_ship' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_ready_to_ship')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_ready_to_ship')}
            >
              <h3>Gotowe do wysyłki</h3>
              {reports.online_ready_to_ship?.map(report => (
                <ReportCard key={report.id} report={report} status="online_ready_to_ship" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.shipped} 
                ${dragOverStatus === 'online_shipped' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_shipped' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_shipped')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_shipped')}
            >
              <h3>Wysłane</h3>
              {reports.online_shipped?.map(report => (
                <ReportCard key={report.id} report={report} status="online_shipped" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.delivered} 
                ${dragOverStatus === 'online_delivered' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_delivered' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_delivered')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_delivered')}
            >
              <h3>Odebrane przez klienta</h3>
              {reports.online_delivered?.map(report => (
                <ReportCard key={report.id} report={report} status="online_delivered" />
              ))}
            </div>

            <div 
              className={`${styles.statusColumn} ${styles.rejected} 
                ${dragOverStatus === 'online_rejected' ? styles.dragOver : ''} 
                ${invalidDropStatus === 'online_rejected' ? styles.invalidDrop : ''}`}
              onDragOver={(e) => handleDragOver(e, 'online_rejected')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'online_rejected')}
            >
              <h3>Zgłoszenia odrzucone</h3>
              {reports.online_rejected?.map(report => (
                <ReportCard key={report.id} report={report} status="online_rejected" />
              ))}
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