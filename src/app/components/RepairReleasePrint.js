import React from 'react';
import styles from './RepairReleasePrint.module.css';
import logoImage from '../img/logo.png';

export default function RepairReleasePrint({ repair, summary, cost }) {
  const formatDate = (date) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const dayName = days[dateObj.getDay()];
    return `${day} ${month} ${year}, ${dayName}`;
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const dayName = days[dateObj.getDay()];
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${dayName}, ${hours}:${minutes}`;
  };

  const getEquipmentType = () => {
    const parts = [];
    if (repair.manufacturer) parts.push(repair.manufacturer);
    if (repair.model) parts.push(repair.model);
    if (repair.equipment_type && !parts.length) parts.push(repair.equipment_type);
    return parts.join(' ') || repair.equipment_type || '-';
  };

  return (
    <div className={styles.printContainer}>
      <div className={styles.header}>
        <div className={styles.logoTopLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoImage.src || logoImage}
            alt="IT-PREMIUM Logo"
            className={styles.logoImage}
          />
        </div>
        <div className={styles.companyInfo}>
          <p>IT-PREMIUM Centrum Serwisowe</p>
          <p>os. Jana III Sobieskiego 41F 60-688 Poznań</p>
          <p>tel.: 784 784 957</p>
        </div>
      </div>

      <div className={styles.title}>
        <h2>Potwierdzenie wydania sprzętu z serwisu</h2>
        <p className={styles.receiptNumber}>numer {repair.order_number || `RMA/${repair.id}`}</p>
      </div>

      <div className={styles.repairInfoSection}>
        <h3>Informacje o naprawie</h3>
        <div className={styles.repairInfo}>
          <p><strong>Klient:</strong> {repair.clients?.name || '-'}</p>
          <p><strong>Dane kontaktowe:</strong> tel.:{repair.clients?.phone ? (repair.clients.phone.startsWith('+48') ? ` ${repair.clients.phone}` : ` +48 ${repair.clients.phone}`) : '-'}{repair.clients?.email ? ` ${repair.clients.email}` : ''}</p>
          <p><strong>Data przyjęcia:</strong> {formatDate(repair.created_at)}</p>
          <p><strong>Data zakończenia naprawy:</strong> {formatDate(repair.updated_at || repair.created_at)}</p>
          <p><strong>Data wydania:</strong> {formatDateTime(repair.collected_at || new Date())}</p>
          <p><strong>Typ sprzętu:</strong> {repair.equipment_type || '-'}</p>
          <p><strong>Producent:</strong> {repair.manufacturer || '-'}</p>
          <p><strong>Model:</strong> {repair.model || '-'}</p>
          <p><strong>Numer seryjny:</strong> {repair.serial_number || '-'}</p>
        </div>
      </div>

      <div className={styles.repairDescriptionSection}>
        <h3>Opis naprawy</h3>
        <div className={styles.repairDescription}>
          {summary || '-'}
        </div>
      </div>

      <div className={styles.costSection}>
        <h3>Koszt naprawy brutto</h3>
        <p className={styles.costAmount}>{cost ? `${parseFloat(cost).toFixed(2)}zł` : '-'}</p>
      </div>

      <div className={styles.confirmationBox}>
        <p>Potwierdzam odbiór oddanego do naprawy przez firmę IT-PREMIUM Centrum Serwisowe z siedzibą os. Jana III Sobieskiego 41F 60-688 Poznań sprzętu wraz ze wszystkimi dołączonymi akcesoriami. Jednocześnie potwierdzam, iż przeprowadzona naprawa wyeliminowała zgłoszoną usterkę i odbieram sprzęt sprawny, pozbawiony zgłoszonych wad.</p>
      </div>

      <div className={styles.signatures}>
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis serwisu</p>
        </div>
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis klienta</p>
        </div>
      </div>
    </div>
  );
}
