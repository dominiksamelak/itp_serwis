"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from '../utils/supabaseClients';
import styles from "./page.module.css";
import Navbar from "../components/Navbar";

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.clientId;
  const [client, setClient] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      setClient(clientData);
      const { data: repairsData } = await supabase
        .from('equipment_repairs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      setRepairs(repairsData || []);
      setLoading(false);
    }
    if (clientId) fetchData();
  }, [clientId]);

  if (loading) return <div className={styles.pageContainer}><Navbar /><div className={styles.content}>Ładowanie...</div></div>;
  if (!client) return <div className={styles.pageContainer}><Navbar /><div className={styles.content}>Nie znaleziono klienta.</div></div>;

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
                  <td className={`${styles.statusCell} ${styles['status-' + repair.status]}`}>{
                    repair.status === 'new' ? 'Nowe zgłoszenie' :
                    repair.status === 'in_progress' ? 'W trakcie realizacji' :
                    repair.status === 'ready_for_pickup' ? 'Gotowe do odbioru' :
                    repair.status === 'collected' ? 'Odebrane' :
                    repair.status === 'cancelled' ? 'Zgłoszenie odrzucone' :
                    repair.status
                  }</td>
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