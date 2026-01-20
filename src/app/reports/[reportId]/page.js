// app/reports/[reportId]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import styles from "./report-details.module.css";
import { supabase } from "../../utils/supabaseClients";
import RepairSummaryPrint from "../RepairPrintSummary";

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [summarySaved, setSummarySaved] = useState(false);
  const printWindowRef = useRef(null);

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
      setNotes(updatedRepair.notes || "");
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
      setSummary(updatedRepair.repair_summary || "");
      setCost(updatedRepair.repair_cost || "");
      setNotes(updatedRepair.notes || "");
      updateEditMode(updatedRepair);
      setSummarySaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!repair) return;

    try {
      const res = await fetch(`/api/repairs/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: repair.id,
          notes: notes,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save notes");
      }
      const data = await res.json();
      const updatedRepair = data[0];
      setRepair(updatedRepair);
      setNotes(updatedRepair.notes || "");
      setIsEditingNotes(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      if (printWindowRef.current) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Repair Summary - ${repair.order_number || repair.id}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print { body { margin: 0; } }
                h2, h3 { margin: 0 0 10px; }
                p { margin: 5px 0; }
                div { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              ${printWindowRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setShowPrintPreview(false);
      }
    }, 100);
  };

  const handlePrintReceipt = () => {
    router.push(`/print-receipt/${reportId}`);
  };

  const handleEditClick = () => {
    setIsEditingSummary(true);
  };

  useEffect(() => {
    if (reportId) {
      const fetchRepairDetails = async () => {
        try {
          const { data, error } = await supabase
            .from("equipment_repairs")
            .select("*, clients(*)")
            .eq("id", reportId)
            .single();

          if (error) {
            throw error;
          }

          setRepair(data);
          setSummary(data.repair_summary || "");
          setCost(data.repair_cost || "");
          setNotes(data.notes || "");
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
          <h1>Szczegóły zgłoszenia: {repair.order_number || `#${repair.id}`}</h1>
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
                <option value="servkom">SERVKOM</option>
              </select>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Klient</span>
              <Link href={`/client-info?clientId=${repair.client_id}`} className={styles.clientLink}>
                <span className={styles.value}>{repair.clients?.name || "-"}</span>
              </Link>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Typ sprzętu</span>
              <span className={styles.value}>{repair.equipment_type || "-"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Producent</span>
              <span className={styles.value}>{repair.manufacturer || "-"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Model</span>
              <span className={styles.value}>{repair.model || "-"}</span>
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
              <p className={styles.value}>{repair.issue_description || "-"}</p>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Data zgłoszenia</span>
              <span className={styles.value}>
                {new Date(repair.created_at).toLocaleString()}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Przyjął</span>
              <span className={styles.value}>{repair.assigned_to || "-"}</span>
            </div>
            <div className={`${styles.detailItem} ${styles.gridColSpan2}`}>
              <span className={styles.label}>Notatki</span>
              {isEditingNotes ? (
                <>
                  <textarea
                    className={styles.textarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    placeholder="Wprowadź notatki..."
                  />
                  <div className={styles.notesButtonContainer}>
                    <button
                      className={styles.saveButton}
                      onClick={handleSaveNotes}
                    >
                      Zapisz
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(repair.notes || "");
                      }}
                    >
                      Anuluj
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.value}>{notes || "-"}</p>
                  <button
                    className={styles.editButton}
                    onClick={handleEditNotes}
                  >
                    Edytuj
                  </button>
                </>
              )}
            </div>
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
                        disabled={!cost || cost.trim() === ''}
                      >
                        Zapisz podsumowanie
                      </button>
                    ) : (
                      <>
                        <button
                          className={styles.saveButton}
                          onClick={handleEditClick}
                        >
                          Edytuj podsumowanie
                        </button>
                        {summary && cost && (
                          <button
                            className={styles.printButton}
                            onClick={() => router.push(`/print-summary/${repair.id}`)}
                          >
                            Drukuj podsumowanie
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Floating print button for new repairs */}
          {repair && repair.status === "new" && (
            <button
              className={styles.floatingPrintButton}
              onClick={handlePrintReceipt}
              title="Drukuj potwierdzenie przyjęcia"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9V2H18V9M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18M6 14H18V22H6V14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showPrintPreview && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div ref={printWindowRef}>
            <RepairSummaryPrint
              repair={repair}
              summary={summary}
              cost={cost}
            />
          </div>
        </div>
      )}


    </div>
  );
}