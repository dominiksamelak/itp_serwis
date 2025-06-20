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
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragSourceColumn, setDragSourceColumn] = useState(null);

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
    setDragSourceColumn(status);
  };

  const handleDragEnd = () => {
    setDragSourceColumn(null);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e, columnKey) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDragSourceColumn(null);
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
                className={[
                  styles.statusColumn,
                  styles[className],
                  dragOverColumn === key ? styles.dragOver : "",
                  dragSourceColumn && dragSourceColumn !== key ? styles.highlightDropTarget : ""
                ].join(" ")}
                onDragOver={(e) => handleDragOver(e, key)}
                onDragLeave={(e) => handleDragLeave(e, key)}
                onDrop={(e) => handleDrop(e, key)}
              >
                <h3>{label}</h3>
                <div className={styles.cardsContainer}>
                  {repairs
                    .filter((repair) => repair.status === key)
                    .map((repair) => (
                      <div
                        key={repair.id}
                        className={styles.reportCard}
                        draggable
                        onDragStart={(e) => handleDragStart(e, repair.id, key)}
                        onDragEnd={handleDragEnd}
                      >
                        <h4>
                          {repair.order_number || `#${repair.id}`}
                        </h4>
                        <p>
                          Klient: {repair.clients?.name || "-"}
                        </p>
                        <p>
                          Data: {new Date(repair.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          {repair.clients?.name || '-'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
