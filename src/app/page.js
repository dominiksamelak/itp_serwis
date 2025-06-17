"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import { supabase } from './utils/supabaseClients';

const STATUSES = {
  new: "Nowe zgłoszenie",
  in_progress: "W trakcie realizacji",
  ready_for_pickup: "Gotowe do odbioru",
  collected: "Odebrane",
  cancelled: "Zgłoszenie odrzucone"
};

export default function Home() {
  const router = useRouter();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_repairs')
        .select(`*, clients ( name, phone, email )`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('Fetched repairs:', data);
      setRepairs(data);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, repairId) => {
    e.dataTransfer.setData('repairId', repairId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const repairId = e.dataTransfer.getData('repairId');
    try {
      const { error } = await supabase
        .from('equipment_repairs')
        .update({ status: newStatus })
        .eq('id', repairId);
      if (error) throw error;
      setRepairs(repairs.map(repair =>
        repair.id === parseInt(repairId) ? { ...repair, status: newStatus } : repair
      ));
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleDetailsClick = (repairId) => {
    // Implement details navigation if needed
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

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.kanbanBoard}>
          {Object.entries(STATUSES).map(([status, label]) => (
            <div
              key={status}
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <h3>{label}</h3>
              <div className={styles.reportsList}>
                {repairs
                  .filter(repair => repair.status === status)
                  .map(repair => (
                    <div
                      key={repair.id}
                      className={styles.reportCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, repair.id)}
                    >
                      <div className={styles.reportHeader}>
                        <span className={styles.reportNumber}>{repair.id}</span>
                        <span className={styles.reportDate}>
                          {new Date(repair.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.reportTitle}>{repair.equipment_type} - {repair.manufacturer} {repair.model}</div>
                      <div className={styles.reportClient}>
                        {repair.clients?.name}
                      </div>
                      <div className={styles.equipmentInfo}>
                        <div>{repair.equipment_type}</div>
                        <div>{repair.manufacturer} {repair.model}</div>
                        <div>S/N: {repair.serial_number}</div>
                        {repair.password && (
                          <div>Hasło: {repair.password}</div>
                        )}
                      </div>
                      <button
                        className={styles.detailsButton}
                        onClick={() => handleDetailsClick(repair.id)}
                      >
                        Szczegóły
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
