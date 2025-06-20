"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import styles from "./report-details.module.css";
import { supabase } from "../../utils/supabaseClients";

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [cost, setCost] = useState("");
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const updateEditMode = (repairData) => {
    if (
      repairData.status === "readyForPickup" &&
      !repairData.repair_summary &&
      !repairData.repair_cost
    ) {
      setIsEditingSummary(true);
    } else {
      setIsEditingSummary(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!repair) return;

    try {
      const res = await fetch(`/api/repairs/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repair.id, status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      const data = await res.json();
      const updatedRepair = data[0];
      setRepair(updatedRepair);
      setSummary(updatedRepair.repair_summary || "");
      setCost(updatedRepair.repair_cost || "");
      updateEditMode(updatedRepair);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSummary = async () => {
    if (!repair) return;

    try {
      const res = await fetch(`/api/repairs/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: repair.id,
          repair_summary: summary,
          repair_cost: cost ? parseFloat(cost) : null,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save summary");
      }
      const data = await res.json();
      const updatedRepair = data[0];
      setRepair(updatedRepair);
      updateEditMode(updatedRepair);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = () => {
    setIsEditingSummary(true);
  };

  useEffect(() => {
    if (reportId) {
      const fetchRepairDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('equipment_repairs')
            .select('*, clients(*)')
            .eq('id', reportId)
            .single();

          if (error) {
            throw error;
          }

          setRepair(data);
          setSummary(data.repair_summary || "");
          setCost(data.repair_cost || "");
          updateEditMode(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRepairDetails();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.content}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.content}>
          <p className={styles.error}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.content}>
          <p>Repair not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.detailsCard}>
          <h1>
            Szczegóły zgłoszenia: {repair.order_number || `#${repair.id}`}
          </h1>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Status</span>
              <select
                className={`${styles.statusSelect} ${
                  styles[
                    `status-border-${repair.status
                      .replace(/([A-Z])/g, "_$1")
                      .toLowerCase()}`
                  ]
                }`}
                value={repair.status}
                onChange={handleStatusChange}
              >
                <option value="new">Nowe zgłoszenie</option>
                <option value="inProgress">W trakcie realizacji</option>
                <option value="readyForPickup">Gotowe do odbioru</option>
                <option value="collected">Odebrane</option>
                <option value="cancelled">Anulowane</option>
              </select>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Klient</span>
              <Link href={`/client-info?clientId=${repair.client_id}`} className={styles.clientLink}>
                <span className={styles.value}>{repair.clients?.name || "-"}</span>
              </Link>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Sprzęt</span>
              <span className={styles.value}>
                {repair.manufacturer} {repair.model}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Numer seryjny</span>
              <span className={styles.value}>{repair.serial_number || "-"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Zasilacz w zestawie</span>
              <span className={styles.value}>{repair.power_adapter_included ? "Tak" : "Nie"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Kopia danych</span>
              <span className={styles.value}>{repair.data_backup_requested ? "Tak" : "Nie"}</span>
            </div>
            <div className={`${styles.detailItem} ${styles.gridColSpan2}`}>
              <span className={styles.label}>Opis usterki</span>
              <p className={styles.value}>{repair.description || "-"}</p>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Data zgłoszenia</span>
              <span className={styles.value}>
                {new Date(repair.created_at).toLocaleString()}
              </span>
            </div>
            {repair.collected_at && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Data odbioru</span>
                <span className={styles.value}>
                  {new Date(repair.collected_at).toLocaleString()}
                </span>
              </div>
            )}
            {(repair.status === "readyForPickup" || repair.status === "collected") && (
              <>
                <div className={`${styles.detailItem} ${styles.gridColSpan2}`}>
                  <span className={styles.label}>Opis wykonanych czynności</span>
                  {repair.status === "readyForPickup" && isEditingSummary ? (
                    <textarea
                      id="summary"
                      className={styles.textarea}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows="4"
                    />
                  ) : (
                    <p className={styles.value}>{summary || "-"}</p>
                  )}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Koszt naprawy</span>
                  {repair.status === "readyForPickup" && isEditingSummary ? (
                    <div className={styles.costInputWrapper}>
                      <input
                        id="cost"
                        type="number"
                        className={styles.input}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                      />
                      <span className={styles.currencySymbol}>zł</span>
                    </div>
                  ) : (
                    <p className={styles.value}>{cost ? `${cost} zł` : "-"}</p>
                  )}
                </div>
                {repair.status === "readyForPickup" && (
                  <div
                    className={`${styles.detailItem} ${styles.gridColSpan2} ${styles.saveButtonContainer}`}
                  >
                    {isEditingSummary ? (
                      <button
                        className={styles.saveButton}
                        onClick={handleSaveSummary}
                      >
                        Zapisz podsumowanie
                      </button>
                    ) : (
                      <button
                        className={styles.saveButton}
                        onClick={handleEditClick}
                      >
                        Edytuj podsumowanie
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 