"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";
import { supabase } from "../utils/supabaseClients";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClient, setSelectedClient] = useState(null);
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,phone,email,street,city,zipcode");
      if (!error) setClients(data);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const handleClientClick = async (client) => {
    setSelectedClient(client);
    const { data, error } = await supabase
      .from("equipment_repairs")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setRepairs(data);
    }
  };

  const getPaginated = (arr, page) =>
    arr.slice((page - 1) * pageSize, page * pageSize);
  const getTotalPages = (arr) => Math.ceil(arr.length / pageSize);

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
        <div className={styles.tableHeaderRow}>
          <h2>Lista klientów</h2>
          <div className={styles.pageSizeSelectWrapper}>
            <label htmlFor="clientPageSize" className={styles.pageSizeLabel}>
              Na stronę:
            </label>
            <select
              id="clientPageSize"
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
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

        <div className={styles.tablesContainer}>
          <table className={styles.clientsTable}>
            <thead>
              <tr>
                <th>Imię i nazwisko</th>
                <th>Numer telefonu</th>
                <th>Adres email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Ładowanie...</td>
                </tr>
              ) : (
                getPaginated(clients, page).map((client) => (
                  <tr
                    key={client.id}
                    className={
                      selectedClient?.id === client.id ? styles.selectedRow : ""
                    }
                  >
                    <td className={styles.nameCell}>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{client.email}</td>
                    <td>
                      <button
                        className={styles.detailsButton}
                        onClick={() => handleClientClick(client)}
                      >
                        Szczegóły
                      </button>
                      <button
                        className={styles.addReportButton}
                        style={{ marginLeft: "0.5rem" }}
                        onClick={() =>
                          router.push(`/add-equipment/${client.id}`)
                        }
                      >
                        Dodaj zgłoszenie
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {selectedClient && (
            <div className={styles.repairsSection}>
              <h3>Historia napraw dla: {selectedClient.name}</h3>
              {repairs.length === 0 ? (
                <p className={styles.noRepairs}>Brak historii napraw</p>
              ) : (
                <table className={styles.repairsTable}>
                  <thead>
                    <tr>
                      <th>Numer zgłoszenia</th>
                      <th>Status</th>
                      <th>Typ sprzętu</th>
                      <th>Producent</th>
                      <th>Model</th>
                      <th>Przyjął</th>
                      <th>Data zgłoszenia</th>
                      <th>Data zakończenia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((repair) => (
                      <tr key={repair.id}>
                        <td>
                          <Link href={`/reports/${repair.id}`} className={styles.repairLink}>
                            {repair.order_number || "-"}
                          </Link>
                        </td>
                        <td
                          className={`${styles.statusCell} ${
                            styles["status-" + getStatusCssClass(repair.status)]
                          }`}
                        >
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
                        </td>
                        <td>{repair.equipment_type}</td>
                        <td>{repair.manufacturer}</td>
                        <td>{repair.model}</td>
                        <td>{repair.assigned_to || '-'}</td>
                        <td>
                          {new Date(repair.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {(repair.status === 'collected' || repair.status === 'cancelled')
                            ? new Date(repair.collected_at || repair.cancelled_at).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {getTotalPages(clients) > 1 && (
          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(1)}>
              &laquo;
            </button>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              &lt;
            </button>
            {(() => {
              const totalPages = getTotalPages(clients);
              const maxVisiblePages = 7;
              let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // Adjust start page if we're near the end
              if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              const pages = [];
              
              // Add first page if not in range
              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    disabled={page === 1}
                    className={page === 1 ? styles.activePage : ""}
                    onClick={() => setPage(1)}
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pages.push(<span key="ellipsis1" className={styles.ellipsis}>...</span>);
                }
              }
              
              // Add visible pages
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    disabled={page === i}
                    className={page === i ? styles.activePage : ""}
                    onClick={() => setPage(i)}
                  >
                    {i}
                  </button>
                );
              }
              
              // Add last page if not in range
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(<span key="ellipsis2" className={styles.ellipsis}>...</span>);
                }
                pages.push(
                  <button
                    key={totalPages}
                    disabled={page === totalPages}
                    className={page === totalPages ? styles.activePage : ""}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pages;
            })()}
            <button
              disabled={page === getTotalPages(clients)}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
            <button
              disabled={page === getTotalPages(clients)}
              onClick={() => setPage(getTotalPages(clients))}
            >
              &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
