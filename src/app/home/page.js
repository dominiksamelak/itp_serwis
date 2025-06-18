"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";

const STATUSES = [
  { key: "new", label: "Nowe zgłoszenia", className: "newReports" },
  { key: "inProgress", label: "W trakcie realizacji", className: "inProgress" },
  {
    key: "readyForPickup",
    label: "Gotowe do odbioru",
    className: "readyForPickup",
  },
  { key: "collected", label: "Odebrane", className: "completed" },
  { key: "cancelled", label: "Zgłoszenia odrzucone", className: "cancelled" },
];

export default function HomePage() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const res = await fetch("/api/repairs");
      const data = await res.json();
      if (res.ok) {
        setRepairs(data);
      } else {
        throw new Error(data.error || "Failed to fetch repairs");
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, repairId, status) => {
    e.dataTransfer.setData("repairId", repairId);
    e.dataTransfer.setData("fromStatus", status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const repairId = Number(e.dataTransfer.getData("repairId"));
    try {
      const res = await fetch("/api/repairs/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repairId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setRepairs(
        repairs.map((repair) =>
          repair.id === repairId ? { ...repair, status: newStatus } : repair
        )
      );
    } catch (error) {
      setErrorMsg(error.message);
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
  console.log(
    "All statuses:",
    repairs.map((r) => r.status)
  );
  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <section className={styles.reportsSection}>
          <h2>Zgłoszenia lokalne</h2>
          <div className={`${styles.reportsGrid} ${styles.localReportsGrid}`}>
            {STATUSES.map(({ key, label, className }) => (
              <div
                key={key}
                className={`${styles.statusColumn} ${styles[className]}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
              >
                <h3>{label}</h3>
                {repairs
                  .filter((repair) => repair.status === key)
                  .map((repair) => (
                    <div
                      key={repair.id}
                      className={styles.reportCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, repair.id, key)}
                    >
                      <div className={styles.reportTitle}>
                        <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                          {repair.order_number || `#${repair.id}`}
                        </span>
                      </div>
                      <div style={{ color: "#9ca3af", marginBottom: 4 }}>
                        Klient: {repair.clients?.name || "-"}
                      </div>
                      <div style={{ color: "#9ca3af", marginBottom: 4 }}>
                        Data: {new Date(repair.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ color: "#9ca3af" }}>
                        Sprzęt: {repair.manufacturer} {repair.model}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
