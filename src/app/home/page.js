"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  { key: "cancelled", label: "Anulowane", className: "cancelled" },
];

const Column = ({ title, repairs, status, className }) => (
  <div className={`${styles.statusColumn} ${styles[className]}`}>
    <h3>{title}</h3>
    <div className={styles.cardsContainer}>
      {repairs.map((repair) => (
        <Card key={repair.id} repair={repair} status={status} />
      ))}
    </div>
  </div>
);

const Card = ({ repair, status }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("repairId", repair.id);
    e.dataTransfer.setData("fromStatus", status);
  };

  const handleDragEnd = () => {
    // Handle drag end if needed
  };

  return (
    <div
      className={`${styles.reportCard} ${styles.dragging}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Link href={`/reports/${repair.id}`} passHref>
        <h4>{repair.order_number || `#${repair.id}`}</h4>
      </Link>
      <p>Klient: {repair.clients?.name || "-"}</p>
      <p>
        Data:{" "}
        {repair.status === "collected" || repair.status === "cancelled"
          ? new Date(
              repair.collected_at || repair.cancelled_at
            ).toLocaleDateString()
          : new Date(repair.created_at).toLocaleDateString()}
      </p>
      <p>{repair.clients?.name || '-'}</p>
    </div>
  );
};

export default function HomePage() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragSourceColumn, setDragSourceColumn] = useState(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await fetch("/api/repairs");
        if (!response.ok) {
          throw new Error("Failed to fetch repairs");
        }
        const data = await response.json();
        setRepairs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRepairs();
  }, []);

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
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <div className={styles.pageContainer}><Navbar /><div className={styles.content}>Ładowanie...</div></div>;
  if (error) return <div className={styles.pageContainer}><Navbar /><div className={styles.content}>Błąd: {error}</div></div>;

  const getColumnRepairs = (status) =>
    repairs.filter((repair) => repair.status === status);

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
                  {getColumnRepairs(key).map((repair) => (
                    <div
                      key={repair.id}
                      className={styles.reportCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, repair.id, key)}
                      onDragEnd={handleDragEnd}
                    >
                      <Link href={`/reports/${repair.id}`} passHref>
                        <h4>{repair.order_number || `#${repair.id}`}</h4>
                      </Link>
                      <p>Klient: {repair.clients?.name || "-"}</p>
                      <p>
                        Data:{" "}
                        {repair.status === "collected" || repair.status === "cancelled"
                          ? new Date(
                              repair.collected_at || repair.cancelled_at
                            ).toLocaleDateString()
                          : new Date(repair.created_at).toLocaleDateString()}
                      </p>
                      <p>{repair.clients?.name || '-'}</p>
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
