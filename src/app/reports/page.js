"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";
import ReportCard from "../components/ReportCard";
import { useReports } from "../context/ReportsContext";
import { ReportsProvider } from "../context/ReportsContext";
import { supabase } from "../utils/supabaseClients";

function ReportsPageContent() {
  const { reports, moveReport } = useReports();
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [invalidDropStatus, setInvalidDropStatus] = useState(null);
  const [expanded, setExpanded] = useState(null); // 'local', 'online', or null
  const [localPage, setLocalPage] = useState(1);
  const [onlinePage, setOnlinePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  // Combine and sort zgłoszenia for local and online
  const localStatuses = [
    "new",
    "inProgress",
    "readyForPickup",
    "collected",
    "cancelled",
  ];
  const onlineStatuses = [
    "online_new",
    "online_approved",
    "online_in_transport",
    "online_in_progress",
    "online_ready_to_ship",
    "online_shipped",
    "online_delivered",
    "online_rejected",
  ];

  const allLocalReports = localStatuses
    .flatMap((status) => (reports[status] || []).map((r) => ({ ...r, status })))
    .sort((a, b) => b.id - a.id);
  const allOnlineReports = onlineStatuses
    .flatMap((status) => (reports[status] || []).map((r) => ({ ...r, status })))
    .sort((a, b) => b.id - a.id);

  const getPaginated = (arr, page) =>
    arr.slice((page - 1) * pageSize, page * pageSize);
  const getTotalPages = (arr) => Math.ceil(arr.length / pageSize);

  const isValidMove = (fromStatus, toStatus) => {
    // Don't allow moving to the same column
    if (fromStatus === toStatus) return false;

    // Check if both statuses are from the same section (local or online)
    const isFromLocal = !fromStatus.startsWith("online_");
    const isToLocal = !toStatus.startsWith("online_");

    // Only allow moves within the same section
    return isFromLocal === isToLocal;
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    const data = e.dataTransfer.types.includes("application/json")
      ? JSON.parse(e.dataTransfer.getData("application/json"))
      : null;

    if (data) {
      if (data.fromStatus === status) {
        setDragOverStatus(null);
        setInvalidDropStatus(null);
      } else if (isValidMove(data.fromStatus, status)) {
        setDragOverStatus(status);
        setInvalidDropStatus(null);
      } else {
        setInvalidDropStatus(status);
        setDragOverStatus(null);
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
    setInvalidDropStatus(null);
  };

  const handleDrop = (e, toStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setInvalidDropStatus(null);
    const data = JSON.parse(e.dataTransfer.getData("application/json"));

    if (isValidMove(data.fromStatus, toStatus)) {
      moveReport(data.reportId, data.fromStatus, toStatus);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment_repairs")
        .select("*, clients ( name )")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRepairs(data);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  function getStatusCssClass(status) {
    if (status === "collected") return "collected";
    if (status === "inProgress") return "in_progress";
    if (status === "readyForPickup") return "ready_for_pickup";
    if (status === "new") return "new";
    if (status === "cancelled") return "cancelled";
    return status;
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        {/* Choice buttons at the top if nothing is expanded */}
        {expanded === null && (
          <div className={styles.choiceButtons}>
            <button
              className={styles.choiceButton}
              onClick={() => setExpanded("local")}
            >
              Zgłoszenia lokalne
            </button>
            <button
              className={styles.choiceButton}
              onClick={() => setExpanded("online")}
            >
              Zgłoszenia online
            </button>
          </div>
        )}
        {/* Expanded local section */}
        {expanded === "local" && (
          <div className={styles.expandedSectionRow}>
            <section
              className={styles.expandedReportsSection}
              style={{ width: "90%" }}
            >
              <div className={styles.tableHeaderRow}>
                <h2>Zgłoszenia lokalne</h2>
                <div className={styles.pageSizeSelectWrapper}>
                  <label
                    htmlFor="localPageSize"
                    className={styles.pageSizeLabel}
                  >
                    Na stronę:
                  </label>
                  <select
                    id="localPageSize"
                    className={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setLocalPage(1);
                    }}
                  >
                    {[10, 15, 20, 25, 30, 35, 40].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                className={styles.tableWrapper}
                style={{ marginBottom: "70px" }}
              >
                <table className={styles.reportsTable}>
                  <thead>
                    <tr>
                      <th>Numer zgłoszenia</th>
                      <th>Klient</th>
                      <th>Sprzęt</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5}>Ładowanie...</td>
                      </tr>
                    ) : (
                      getPaginated(repairs, localPage).map((repair) => (
                        <>
                          <tr key={repair.id}>
                            <td className={styles.centered}>
                              {repair.order_number || "-"}
                            </td>
                            <td className={styles.centered}>
                              {repair.clients?.name || "-"}
                            </td>
                            <td className={styles.centered}>
                              {repair.manufacturer} {repair.model}
                            </td>
                            <td
                              className={`${styles.statusCell} ${
                                styles[
                                  "status-" + getStatusCssClass(repair.status)
                                ]
                              }`}
                            >
                              <span>
                                {repair.status === "new"
                                  ? "Nowe zgłoszenie"
                                  : repair.status === "inProgress"
                                  ? "W trakcie realizacji"
                                  : repair.status === "readyForPickup"
                                  ? "Gotowe do odbioru"
                                  : repair.status === "collected"
                                  ? "Odebrane"
                                  : repair.status === "cancelled"
                                  ? "Zgłoszenie odrzucone"
                                  : repair.status}
                              </span>
                            </td>
                            <td className={styles.centered}>
                              <button
                                className={styles.detailsButton}
                                onClick={() =>
                                  setExpandedRow(
                                    expandedRow === repair.id ? null : repair.id
                                  )
                                }
                              >
                                Szczegóły
                              </button>
                            </td>
                          </tr>
                          {expandedRow === repair.id && (
                            <tr>
                              <td colSpan={5}>
                                <div className={styles.detailsBox}>
                                  <strong>Numer zgłoszenia:</strong>{" "}
                                  {repair.order_number || "-"}
                                  <br />
                                  <strong>Status:</strong>
                                  <select
                                    value={repair.status}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      const { error } = await supabase
                                        .from("equipment_repairs")
                                        .update({ status: newStatus })
                                        .eq("id", repair.id);
                                      if (!error) {
                                        setRepairs((repairs) =>
                                          repairs.map((r) =>
                                            r.id === repair.id
                                              ? { ...r, status: newStatus }
                                              : r
                                          )
                                        );
                                      }
                                    }}
                                    style={{
                                      margin: "0 0 1em 0",
                                      padding: "0.2em 1em",
                                    }}
                                  >
                                    <option value="new">Nowe zgłoszenie</option>
                                    <option value="inProgress">
                                      W trakcie realizacji
                                    </option>
                                    <option value="readyForPickup">
                                      Gotowe do odbioru
                                    </option>
                                    <option value="collected">Odebrane</option>
                                    <option value="cancelled">
                                      Zgłoszenie odrzucone
                                    </option>
                                  </select>
                                  <br />
                                  <strong>Klient:</strong>{" "}
                                  {repair.clients?.name || "-"}
                                  <br />
                                  <strong>Typ sprzętu:</strong>{" "}
                                  {repair.equipment_type}
                                  <br />
                                  <strong>Producent:</strong>{" "}
                                  {repair.manufacturer}
                                  <br />
                                  <strong>Model:</strong> {repair.model}
                                  <br />
                                  <strong>Numer seryjny:</strong>{" "}
                                  {repair.serial_number}
                                  <br />
                                  <strong>Hasło:</strong>{" "}
                                  {repair.password || "-"}
                                  <br />
                                  <strong>Opis usterki:</strong>{" "}
                                  {repair.issue_description}
                                  <br />
                                  <strong>Data zgłoszenia:</strong>{" "}
                                  {new Date(
                                    repair.created_at
                                  ).toLocaleDateString()}
                                  <br />
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination for local */}
                {getTotalPages(repairs) > 1 && (
                  <div className={styles.pagination}>
                    <button
                      disabled={localPage === 1}
                      onClick={() => setLocalPage(1)}
                    >
                      &laquo;
                    </button>
                    <button
                      disabled={localPage === 1}
                      onClick={() => setLocalPage(localPage - 1)}
                    >
                      &lt;
                    </button>
                    {Array.from(
                      { length: getTotalPages(repairs) },
                      (_, i) => i + 1
                    )
                      .slice(Math.max(0, localPage - 5), localPage + 4)
                      .map((page) => (
                        <button
                          key={page}
                          className={
                            localPage === page ? styles.activePage : ""
                          }
                          onClick={() => setLocalPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      disabled={localPage === getTotalPages(repairs)}
                      onClick={() => setLocalPage(localPage + 1)}
                    >
                      &gt;
                    </button>
                    <button
                      disabled={localPage === getTotalPages(repairs)}
                      onClick={() => setLocalPage(getTotalPages(repairs))}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </div>
            </section>
            <button
              className={styles.stickyOtherButtonBottom}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                zIndex: 99,
              }}
              onClick={() => setExpanded("online")}
            >
              Zgłoszenia online
            </button>
          </div>
        )}
        {/* Expanded online section */}
        {expanded === "online" && (
          <div className={styles.expandedSectionRow + " " + styles.alignBottom}>
            <button
              className={styles.stickyOtherButtonTop}
              style={{
                position: "fixed",
                top: "64px",
                left: 0,
                width: "100%",
                zIndex: 99,
              }}
              onClick={() => setExpanded("local")}
            >
              Zgłoszenia lokalne
            </button>
            <section
              className={styles.expandedReportsSection}
              style={{ width: "90%" }}
            >
              <div
                className={styles.tableHeaderRow}
                style={{ marginTop: "70px" }}
              >
                <h2>Zgłoszenia online</h2>
                <div className={styles.pageSizeSelectWrapper}>
                  <label
                    htmlFor="onlinePageSize"
                    className={styles.pageSizeLabel}
                  >
                    Na stronę:
                  </label>
                  <select
                    id="onlinePageSize"
                    className={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setOnlinePage(1);
                    }}
                  >
                    {[10, 15, 20, 25, 30, 35, 40].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.reportsTable}>
                  <thead>
                    <tr>
                      <th>RMA</th>
                      <th>Klient</th>
                      <th>Sprzęt</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginated(allOnlineReports, onlinePage).map(
                      (report) => (
                        <tr key={report.id} className={styles[report.status]}>
                          <td className={styles.centered}>{report.id}</td>
                          <td className={styles.centered}>{report.client}</td>
                          <td className={styles.centered}>
                            {report.title}
                            {report.description ? (
                              <>
                                <br />
                                <span className={styles.deviceDesc}>
                                  {report.description}
                                </span>
                              </>
                            ) : null}
                          </td>
                          <td className={styles.centered}>
                            <span
                              className={
                                styles.statusLabel +
                                " " +
                                styles[report.status + "Label"]
                              }
                            >
                              {report.status === "online_new"
                                ? "Nowe zgłoszenie"
                                : report.status === "online_approved"
                                ? "Zatwierdzone"
                                : report.status === "online_in_transport"
                                ? "W trakcie transportu"
                                : report.status === "online_in_progress"
                                ? "W trakcie realizacji"
                                : report.status === "online_ready_to_ship"
                                ? "Gotowe do wysyłki"
                                : report.status === "online_shipped"
                                ? "Wysłane"
                                : report.status === "online_delivered"
                                ? "Odebrane przez klienta"
                                : report.status === "online_rejected"
                                ? "Odrzucone"
                                : ""}
                            </span>
                          </td>
                          <td className={styles.centered}>
                            <button className={styles.detailsButton}>
                              Szczegóły
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                {/* Pagination for online */}
                {getTotalPages(allOnlineReports) > 1 && (
                  <div className={styles.pagination}>
                    <button
                      disabled={onlinePage === 1}
                      onClick={() => setOnlinePage(1)}
                    >
                      &laquo;
                    </button>
                    <button
                      disabled={onlinePage === 1}
                      onClick={() => setOnlinePage(onlinePage - 1)}
                    >
                      &lt;
                    </button>
                    {Array.from(
                      { length: getTotalPages(allOnlineReports) },
                      (_, i) => i + 1
                    )
                      .slice(Math.max(0, onlinePage - 5), onlinePage + 4)
                      .map((page) => (
                        <button
                          key={page}
                          className={
                            onlinePage === page ? styles.activePage : ""
                          }
                          onClick={() => setOnlinePage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      disabled={onlinePage === getTotalPages(allOnlineReports)}
                      onClick={() => setOnlinePage(onlinePage + 1)}
                    >
                      &gt;
                    </button>
                    <button
                      disabled={onlinePage === getTotalPages(allOnlineReports)}
                      onClick={() =>
                        setOnlinePage(getTotalPages(allOnlineReports))
                      }
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
        {/* If nothing expanded, show nothing else */}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ReportsProvider>
      <ReportsPageContent />
    </ReportsProvider>
  );
}
