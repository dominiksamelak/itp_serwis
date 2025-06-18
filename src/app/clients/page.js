"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
                      <th>Numer seryjny</th>
                      <th>Hasło</th>
                      <th>Opis usterki</th>
                      <th>Data zgłoszenia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((repair) => (
                      <tr key={repair.id}>
                        <td>{repair.order_number || "-"}</td>
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
                        <td>{repair.serial_number}</td>
                        <td>{repair.password || "-"}</td>
                        <td>{repair.issue_description}</td>
                        <td>
                          {new Date(repair.created_at).toLocaleDateString()}
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
            {Array.from({ length: getTotalPages(clients) }, (_, i) => i + 1)
              .slice(Math.max(0, page - 5), page + 4)
              .map((p) => (
                <button
                  key={p}
                  className={page === p ? styles.activePage : ""}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
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
