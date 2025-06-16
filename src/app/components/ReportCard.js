'use client';

import { useState } from 'react';
import styles from './ReportCard.module.css';

export default function ReportCard({ report, status }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      reportId: report.id,
      fromStatus: status
    }));
    // Add a ghost image for better drag preview
    const ghostElement = e.target.cloneNode(true);
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    setTimeout(() => document.body.removeChild(ghostElement), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${styles.reportCard} ${isDragging ? styles.dragging : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h4>{report.title}</h4>
      <p>Klient: {report.client}</p>
      <p>Data: {report.date}</p>
    </div>
  );
} 