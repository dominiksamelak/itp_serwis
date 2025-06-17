"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClients";
import Navbar from "../components/Navbar";
import styles from "../clients/page.module.css";

export default function ClientInfoPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [client, setClient] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!clientId) return;
      setLoading(true);
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();
      setClient(clientData);
      const { data: repairsData } = await supabase
        .from("equipment_repairs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      setRepairs(repairsData || []);
      setLoading(false);
    }
    fetchData();
  }, [clientId]);

  if (!clientId) return <div>Brak ID klienta w adresie URL.</div>;
  if (loading) return <div>Ładowanie...</div>;
  if (!client) return <div>Nie znaleziono klienta.</div>;

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <h2>Szczegóły klienta</h2>
        <div className={styles.clientDetailsBox}>
          <p><b>Imię i nazwisko:</b> {client.name}</p>
          <p><b>Telefon:</b> {client.phone}</p>
          <p><b>Email:</b> {client.email}</p>
          <p><b>Adres:</b> {client.street}, {client.city} {client.zipcode}</p>
        </div>
        <button
          className={styles.detailsButton}
          style={{ margin: '1rem 0 2rem 0' }}
          onClick={() => window.location.href = `/add-equipment/${clientId}`}
        >
          Dodaj nowe zgłoszenie serwisowe
        </button>
        <h3>Historia napraw</h3>
        {repairs.length === 0 ? (
          <p>Brak historii napraw</p>
        ) : (
          <table className={styles.repairsTable}>
            <thead>
              <tr>
                <th>Numer zgłoszenia</th>
                <th>Status</th>
                <th>Typ sprzętu</th>
                <th>Producent</th>
                <th>Model</th>
                <th>Numer seryjny</th>
                <th>Hasło</th>
                <th>Opis usterki</th>
                <th>Data zgłoszenia</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(repair => (
                <tr key={repair.id}>
                  <td>{repair.order_number || '-'}</td>
                  <td>{repair.status}</td>
                  <td>{repair.equipment_type}</td>
                  <td>{repair.manufacturer}</td>
                  <td>{repair.model}</td>
                  <td>{repair.serial_number}</td>
                  <td>{repair.password || '-'}</td>
                  <td>{repair.issue_description}</td>
                  <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 