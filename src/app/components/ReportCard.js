'use client';

import { useState } from 'react';
import styles from './ReportCard.module.css';

const getStatusColor = (status) => {
  switch (status) {
    // Local reports
    case 'new':
      return '#d4a373';
    case 'inProgress':
      return '#1e40af';
    case 'readyForPickup':
      return '#3b82f6';
    case 'completed':
      return '#16a34a';
    case 'cancelled':
      return '#ef4444';
    
    // Online reports
    case 'online_new':
      return '#d4a373';
    case 'online_approved':
      return '#14b8a6';
    case 'online_in_transport':
      return '#f59e0b';
    case 'online_in_progress':
      return '#1e40af';
    case 'online_ready_to_ship':
      return '#8b5cf6';
    case 'online_shipped':
      return '#ec4899';
    case 'online_delivered':
      return '#22c55e';
    case 'online_rejected':
      return '#ef4444';
    default:
      return '#404040';
  }
};

export default function ReportCard({ report, status }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      reportId: report.id,
      fromStatus: status
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const statusColor = getStatusColor(status);

  return (
    <div
      className={`${styles.reportCard} ${isDragging ? styles.dragging : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        border: `2px solid ${statusColor}`,
        boxShadow: isDragging ? `0 0 10px ${statusColor}` : 'none'
      }}
    >
      <h4>{report.title}</h4>
      <p>Klient: {report.client}</p>
      <p>Data: {report.date}</p>
      {report.description && <p>Opis: {report.description}</p>}
    </div>
  );
} 