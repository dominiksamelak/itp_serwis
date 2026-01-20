"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";
import { supabase } from '../../utils/supabaseClients';
import EquipmentReceiptPrint from "../../components/EquipmentReceiptPrint";

const EQUIPMENT_TYPES = [
  "Laptop",
  "PC",
  "Drukarka",
  "Konsola",
  "Telefon",
  "Tablet",
  "Dysk twardy",
  "Nośnik danych",
  "Inny sprzęt"
];

export default function AddEquipmentPage({ params }) {
  const router = useRouter();
  const { clientId } = params;
  const [client, setClient] = useState(null);
  const [form, setForm] = useState({
    equipment_type: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    issue_description: "",
    password: "",
    assigned_to: "",
    power_adapter_included: false,
    data_backup_requested: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const printWindowRef = useRef(null);

  useEffect(() => {
    async function fetchClient() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (!error) {
        setClient(data);
      }
      setLoading(false);
    }
    fetchClient();
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      if (printWindowRef.current) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Equipment Receipt - ${orderNumber}</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${printWindowRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setShowPrintPreview(false);
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      // Get current month and year
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      // Fetch all repairs for this month/year
      const { data: monthRepairs, error: countError } = await supabase
        .from('equipment_repairs')
        .select('id,order_number,created_at')
        .gte('created_at', `${year}-${month}-01`)
        .lt('created_at', `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`);
      if (countError) throw countError;

      // Find the highest used number for this month
      let maxNum = 0;
      if (monthRepairs && monthRepairs.length > 0) {
        monthRepairs.forEach(r => {
          const match = r.order_number && r.order_number.match(/^L(\d{2})\//);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
      }
      const nextNumber = maxNum + 1;
      const orderNumber = `L${String(nextNumber).padStart(2, '0')}/${month}/${year}`;
      setOrderNumber(orderNumber);

      // Insert the equipment repair with status 'new' and order_number
      const { data, error } = await supabase
        .from('equipment_repairs')
        .insert([{
          client_id: clientId,
          equipment_type: form.equipment_type,
          manufacturer: form.manufacturer,
          model: form.model,
          serial_number: form.serial_number,
          password: form.password,
          issue_description: form.issue_description,
          status: 'new',
          order_number: orderNumber,
          assigned_to: form.assigned_to,
          power_adapter_included: form.power_adapter_included,
          data_backup_requested: form.data_backup_requested,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Navigate to the print page
        router.push(`/print-receipt/${data.id}`);
      } else {
        router.push('/clients');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Błąd podczas dodawania sprzętu!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.content}>
          <div>Ładowanie...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.content}>
          <div className={styles.errorMessage}>Nie znaleziono klienta!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <h2>Dodaj sprzęt dla klienta: {client.name}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="equipment_type">Typ sprzętu</label>
            <select
              id="equipment_type"
              name="equipment_type"
              value={form.equipment_type}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Wybierz typ sprzętu</option>
              {EQUIPMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="manufacturer">Producent</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={form.model}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="serial_number">Numer seryjny</label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Hasło</label>
            <input
              type="text"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="issue_description">Opis usterki</label>
            <textarea
              id="issue_description"
              name="issue_description"
              value={form.issue_description}
              onChange={handleChange}
              required
              className={styles.textarea}
            />
          </div>
          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="power_adapter_included"
                checked={form.power_adapter_included}
                onChange={handleChange}
                className={styles.checkboxInput}
              />
              Zasilacz w zestawie
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="data_backup_requested"
                checked={form.data_backup_requested}
                onChange={handleChange}
                className={styles.checkboxInput}
              />
              Kopia danych
            </label>
          </div>
          <div className={styles.formGroup}>
            <label>Przyjmował</label>
            <div className={styles.radioGroup}>
              {["Mariusz", "Dominik", "Krzysztof"].map((name) => (
                <label key={name} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="assigned_to"
                    value={name}
                    checked={form.assigned_to === name}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
          <button
            type="submit"
            className={styles.detailsButton}
            disabled={submitting || !form.assigned_to}
          >
            {submitting ? "Zapisywanie..." : "Zapisz sprzęt"}
          </button>
        </form>
      </div>
      
      {/* Hidden print preview */}
      {showPrintPreview && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={printWindowRef}>
            <EquipmentReceiptPrint 
              client={client} 
              equipment={form} 
              orderNumber={orderNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
} 