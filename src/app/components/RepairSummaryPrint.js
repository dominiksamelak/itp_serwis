import React from 'react';
import styles from './RepairSummaryPrint.module.css';

export default function RepairSummaryPrint({ repair, summary, cost }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  return (
    <div className={styles.printContainer}>
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <h1>IT-Premium</h1>
          <div className={styles.logoPlaceholder}>
            [LOGO]
          </div>
        </div>
        <div className={styles.companyInfo}>
          <p>ul. Przykładowa 123</p>
          <p>00-000 Warszawa</p>
          <p>Tel: +48 123 456 789</p>
          <p>Email: kontakt@it-premium.pl</p>
        </div>
      </div>

      <div className={styles.clientSection}>
        <h2>DANE KLIENTA</h2>
        <div className={styles.clientInfo}>
          <p><strong>Imię i nazwisko:</strong> {repair.clients?.name || '-'}</p>
          <p><strong>Telefon:</strong> {repair.clients?.phone || '-'}</p>
          <p><strong>Email:</strong> {repair.clients?.email || '-'}</p>
          <p><strong>Adres:</strong> {repair.clients?.street || '-'}, {repair.clients?.city || '-'} {repair.clients?.zipcode || '-'}</p>
        </div>
      </div>

      <div className={styles.equipmentSection}>
        <h2>INFORMACJE O SPRZĘCIE</h2>
        <div className={styles.equipmentGrid}>
          <div className={styles.equipmentItem}>
            <strong>Numer zgłoszenia:</strong> {repair.order_number || `#${repair.id}`}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Typ sprzętu:</strong> {repair.equipment_type || '-'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Producent:</strong> {repair.manufacturer || '-'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Model:</strong> {repair.model || '-'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Numer seryjny:</strong> {repair.serial_number || '-'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Zasilacz w zestawie:</strong> {repair.power_adapter_included ? 'Tak' : 'Nie'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Kopia danych:</strong> {repair.data_backup_requested ? 'Tak' : 'Nie'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Opis usterki:</strong> {repair.issue_description || 'Brak opisu'}
          </div>
        </div>
      </div>

      <div className={styles.datesSection}>
        <div className={styles.dateItem}>
          <strong>Data zgłoszenia:</strong> {formatDateTime(repair.created_at)}
        </div>
        <div className={styles.dateItem}>
          <strong>Data zakończenia:</strong> {repair.collected_at ? formatDateTime(repair.collected_at) : formatDateTime(new Date())}
        </div>
      </div>

      <div className={styles.repairSection}>
        <h2>OPIS NAPRAWY</h2>
        <div className={styles.repairDescription}>
          {summary || 'Brak opisu wykonanych czynności'}
        </div>
      </div>

      <div className={styles.costSection}>
        <h2>KOSZT NAPRAWY</h2>
        <div className={styles.costBox}>
          <strong>{cost ? `${cost} zł` : '0 zł'}</strong>
        </div>
      </div>

      <div className={styles.signatures}>
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis serwisanta</p>
          <p className={styles.signatureDate}>Data: {formatDate(new Date())}</p>
        </div>
        
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis klienta</p>
          <p className={styles.signatureDate}>Data: ________________</p>
        </div>
      </div>

      <div className={styles.footer}>
        <p><strong>Uwagi:</strong></p>
        <ul>
          <li>Urządzenie zostało naprawione zgodnie z opisem usterki</li>
          <li>Klient potwierdza odbiór sprzętu w stanie sprawnym</li>
          <li>Gwarancja na wykonane prace: 3 miesiące</li>
          <li>W przypadku problemów prosimy o kontakt</li>
        </ul>
      </div>
    </div>
  );
} 