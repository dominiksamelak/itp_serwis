"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";
import { supabase } from '../../utils/supabaseClients';

const EQUIPMENT_TYPES = [
  "Laptop",
  "PC",
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
    password: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setForm({ ...form, [e.target.name]: e.target.value });
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

      // Insert the equipment repair with status 'new' and order_number
      const { error } = await supabase
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
          order_number: orderNumber
        }]);

      if (error) throw error;

      router.push('/clients');
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
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
          <button type="submit" className={styles.detailsButton} disabled={submitting}>
            {submitting ? 'Zapisywanie...' : 'Zapisz sprzęt'}
          </button>
        </form>
      </div>
    </div>
  );
} 