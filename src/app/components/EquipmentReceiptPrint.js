import React from 'react';
import styles from './EquipmentReceiptPrint.module.css';

export default function EquipmentReceiptPrint({ client, equipment, orderNumber }) {
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

      <div className={styles.title}>
        <h2>POTWIERDZENIE PRZYJĘCIA SPRZĘTU</h2>
        <p className={styles.receiptNumber}>Numer: {orderNumber}</p>
      </div>

      <div className={styles.clientSection}>
        <h3>DANE KLIENTA</h3>
        <div className={styles.clientInfo}>
          <p><strong>Imię i nazwisko:</strong> {client.name}</p>
          <p><strong>Telefon:</strong> {client.phone}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Adres:</strong> {client.street}, {client.city} {client.zipcode}</p>
        </div>
      </div>

      <div className={styles.equipmentSection}>
        <h3>INFORMACJE O SPRZĘCIE</h3>
        <div className={styles.equipmentGrid}>
          <div className={styles.equipmentItem}>
            <strong>Typ sprzętu:</strong> {equipment.equipment_type}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Producent:</strong> {equipment.manufacturer}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Model:</strong> {equipment.model}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Numer seryjny:</strong> {equipment.serial_number}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Zasilacz w zestawie:</strong> {equipment.power_adapter_included ? 'Tak' : 'Nie'}
          </div>
          <div className={styles.equipmentItem}>
            <strong>Kopia danych:</strong> {equipment.data_backup_requested ? 'Tak' : 'Nie'}
          </div>
        </div>
      </div>

      <div className={styles.issueSection}>
        <h3>OPIS USTERKI</h3>
        <div className={styles.issueDescription}>
          {equipment.issue_description}
        </div>
      </div>

      <div className={styles.detailsSection}>
        <div className={styles.detailItem}>
          <strong>Data przyjęcia:</strong> {formatDateTime(new Date())}
        </div>
        <div className={styles.detailItem}>
          <strong>Przyjął:</strong> {equipment.assigned_to}
        </div>
        <div className={styles.detailItem}>
          <strong>Hasło:</strong> {equipment.password || 'Brak'}
        </div>
      </div>

      <div className={styles.signatures}>
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis serwisanta</p>
          <p className={styles.signatureDate}>Data: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>
        
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Podpis klienta</p>
        </div>
      </div>

      <div className={styles.footer}>
        <p><strong>Uwagi:</strong></p>
        <ul>
          <li>Klient potwierdza przekazanie sprzętu w stanie opisanym powyżej</li>
          <li>Serwis nie ponosi odpowiedzialności za dane pozostawione na urządzeniu</li>
          <li>Szacowany czas naprawy zostanie podany po diagnozie</li>
          <li>O zakończeniu naprawy klient zostanie powiadomiony telefonicznie</li>
        </ul>
      </div>
    </div>
  );
} 