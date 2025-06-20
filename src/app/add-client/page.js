"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";
import { supabase } from '../utils/supabaseClients';

export default function AddClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "Poznań",
    zipcode: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingClient, setExistingClient] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [name]: sanitizedValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  useEffect(() => {
    async function checkDuplicate() {
      setExistingClient(null);
      setErrorMsg("");
      if (form.phone.length > 0 || form.email.length > 0) {
        const { data: existing, error: checkError } = await supabase
          .from('clients')
          .select('*')
          .or(`phone.eq.${form.phone},email.eq.${form.email}`);
        if (!checkError && existing && existing.length > 0) {
          setExistingClient(existing[0]);
          setErrorMsg('Klient z tym numerem telefonu lub adresem e-mail już istnieje.');
        }
      }
    }
    checkDuplicate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.phone, form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    // Don't allow submit if duplicate
    if (existingClient) {
      setLoading(false);
      setErrorMsg('Klient z tym numerem telefonu lub adresem e-mail już istnieje.');
      return;
    }
    const { name, phone, email, street, city, zipcode } = form;
    const { data, error } = await supabase.from('clients').insert([
      { name, phone, email, street, city, zipcode }
    ]).select();
    setLoading(false);
    if (!error) {
      setSubmitted(true);
      router.push(`/add-equipment/${data[0].id}`);
    } else {
      setErrorMsg(error.message || 'Błąd podczas dodawania klienta!');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <h2>Dodaj klienta</h2>
        {submitted ? (
          <div className={styles.successMessage}>Klient został dodany!</div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
            <div className={styles.formGroup}>
              <label htmlFor="name">Imię i nazwisko</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Numer telefonu</label>
              <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Adres e-mail</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="street">Ulica</label>
              <input type="text" id="street" name="street" value={form.street} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="city">Miasto</label>
              <input type="text" id="city" name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="zipcode">Kod pocztowy</label>
              <input type="text" id="zipcode" name="zipcode" value={form.zipcode} onChange={handleChange} required />
            </div>
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
            {existingClient && (
              <div className={styles.duplicatePrompt}>
                <p>Czy chcesz dodać nowe zgłoszenie dla tego klienta?</p>
                <button
                  className={styles.detailsButton}
                  type="button"
                  onClick={() => router.push(`/add-equipment/${existingClient.id}`)}
                >
                  Dodaj zgłoszenie
                </button>
              </div>
            )}
            <button type="submit" className={styles.detailsButton} disabled={loading}>
              {loading ? 'Dodawanie...' : 'Dodaj klienta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 