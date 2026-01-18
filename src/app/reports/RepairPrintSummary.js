// components/RepairSummaryPrint.js
import React from "react";
import styles from "./RepairPrintSummary.css";

const RepairSummaryPrint = ({ repair, summary, cost }) => {
  const currentDate = new Date().toLocaleString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(" o ", " "); // Format as "21 września 2025, 17:06"

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h2>IT-Premium</h2>
        <p>[LOGO]</p>
        <p>ul. Przykładowa 123, 00-000 Warszawa</p>
        <p>Tel: +48 123 456 789</p>
        <p>Email: kontakt@it-premium.pl</p>
      </div>

      {/* Client Data Section */}
      <div className={styles.section}>
        <h3>DANE KLIENTA</h3>
        <p><strong>Imię i nazwisko:</strong> {repair.clients?.name || "-"}</p>
        <p><strong>Telefon:</strong> {repair.clients?.phone || "-"}</p>
        <p><strong>Email:</strong> {repair.clients?.email || "-"}</p>
        <p><strong>Adres:</strong> {repair.clients?.address || "-"}</p>
      </div>

      {/* Equipment Info Section */}
      <div className={styles.section}>
        <h3>INFORMACJE O SPRZĘCIE</h3>
        <p><strong>Numer zgłoszenia:</strong> {repair.order_number || "-"}</p>
        <p><strong>Typ sprzętu:</strong> {repair.equipment_type || "-"}</p>
        <p><strong>Producent:</strong> {repair.manufacturer || "-"}</p>
        <p><strong>Model:</strong> {repair.model || "-"}</p>
        <p><strong>Numer seryjny:</strong> {repair.serial_number || "-"}</p>
        <p><strong>Zasilacz w zestawie:</strong> {repair.power_adapter_included ? "Tak" : "Nie"}</p>
        <p><strong>Kopia danych:</strong> {repair.data_backup_requested ? "Tak" : "Nie"}</p>
        <p><strong>Opis usterki:</strong> {repair.issue_description || "-"}</p>
        <p><strong>Data zgłoszenia:</strong> {repair.created_at ? new Date(repair.created_at).toLocaleString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).replace(/:/g, ".") : "-"}</p>
        <p><strong>Data zakończenia:</strong> {currentDate}</p>
      </div>

      {/* Repair Description Section */}
      <div className={styles.section}>
        <h3>OPIS NAPRAWY</h3>
        <p><strong>{summary || "-"}</strong></p>
      </div>

      {/* Repair Cost Section */}
      <div className={styles.section}>
        <h3>KOSZT NAPRAWY</h3>
        <p><strong>{cost ? `${cost} zł` : "-"}</strong></p>
      </div>

      {/* Signatures and Notes Section */}
      <div>
        <div className={styles.signatures}>
          <p><strong>Podpis serwisanta</strong> ___________________________</p>
          <p><strong>Data:</strong> {new Date().toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) || "21.09.2025"}</p>
          <p><strong>Podpis klienta</strong> ___________________________</p>
          <p><strong>Data:</strong> ___________________________</p>
        </div>
      </div>
    </div>
  );
};

export default RepairSummaryPrint;