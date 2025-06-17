"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../utils/supabaseClients';
import styles from "./page.module.css";
import Navbar from "../components/Navbar";

export default function AddReportPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setNotFound(false);
    setSearchResults([]);
    setSelectedClient(null);
    if (!search.trim()) return;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    setSearching(false);
    if (!error && data.length > 0) {
      setSearchResults(data);
    } else {
      setNotFound(true);
    }
  };

  const handleClientClick = (clientId) => {
    router.push(`/client-info?clientId=${clientId}`);
  };

  useEffect(() => {
    let active = true;
    async function fetchClients() {
      setNotFound(false);
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      setSearching(false);
      if (active) {
        if (!error && data.length > 0) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
          setNotFound(true);
        }
      }
    }
    fetchClients();
    return () => { active = false; };
  }, [search]);

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <h2>Dodaj zgłoszenie serwisowe</h2>
        <div className={styles.form} autoComplete="off">
          <label htmlFor="clientSearch">Wyszukaj klienta (imię, nazwisko lub numer telefonu):</label>
          <input
            id="clientSearch"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Wpisz imię, nazwisko lub numer telefonu"
            className={styles.input}
          />
          {searching && <div className={styles.searching}>Szukam...</div>}
          {searchResults.length > 0 && (
            <ul className={styles.dynamicResults}>
              {searchResults.map(client => (
                <li
                  key={client.id}
                  className={styles.clientResult}
                  onClick={() => handleClientClick(client.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{client.name} ({client.phone})</span>
                </li>
              ))}
            </ul>
          )}
          {notFound && search.trim() && !searching && (
            <div className={styles.notFoundBox}>
              <p>Nie znaleziono klienta o podanych danych.</p>
              <button
                className={styles.detailsButton}
                onClick={() => router.push("/add-client")}
              >
                Dodaj nowego klienta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 