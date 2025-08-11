"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import React from 'react';
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";
import { supabase } from "../utils/supabaseClients";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function ReportsPageContent() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localPage, setLocalPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const detailsRef = useRef(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      } else {
        params.delete('status');
      }
      // Using on-page filters clears the global search param 'q'
      params.delete('q');
      
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [statusFilter, pathname, router]);

  useEffect(() => {
    const getReports = async () => {
      setLoading(true);
      setError(null);
      
      const queryParam = searchParams.get("q");
      const statusParam = searchParams.get("status");

      let queryBuilder = supabase
        .from("equipment_repairs")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (statusParam && statusParam !== 'all') {
        queryBuilder = queryBuilder.eq('status', statusParam);
      } else if (queryParam) {
        // Fallback to global search logic
        const { data: clientIds } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', `%${queryParam}%`);
        
        const matchingClientIds = clientIds ? clientIds.map(c => c.id) : [];

        const orFilters = [
          `order_number.ilike.%${queryParam}%`,
          `manufacturer.ilike.%${queryParam}%`,
          `model.ilike.%${queryParam}%`
        ];

        if (matchingClientIds.length > 0) {
          orFilters.push(`client_id.in.(${matchingClientIds.join(',')})`);
        }
        
        queryBuilder = queryBuilder.or(orFilters.join(','));
      }
      
      const { data, error } = await queryBuilder;

      if (error) {
        setError(error.message);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    getReports();
  }, [searchParams]);

  const handleStatusChange = async (repairId, newStatus) => {
    try {
      const { error } = await supabase
        .from("equipment_repairs")
        .update({ status: newStatus })
        .eq("id", repairId);

      if (error) throw error;
      
      setReports(prev => prev.map(r => r.id === repairId ? {...r, status: newStatus} : r));

    } catch (err) {
      console.error(err);
    }
  };

  const statusLabels = {
    new: "Nowe zgłoszenie",
    inProgress: "W trakcie realizacji",
    readyForPickup: "Gotowe do odbioru",
    collected: "Odebrane",
    cancelled: "Anulowane",
  };

  const getPaginated = (data, page) => {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / pageSize);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        if (!event.target.closest("button")) {
          setExpandedRow(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return <div className={styles.pageContainer}><div className={styles.content}>Ładowanie...</div></div>;
  if (error) return <div className={styles.pageContainer}><div className={styles.content}>Błąd: {error}</div></div>;

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.headerContainer}>
          <h2>Zgłoszenia</h2>
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Wszystkie</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.pageSizeSelectWrapper}>
            <label htmlFor="pageSize" className={styles.pageSizeLabel}>
              Na stronę:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={styles.pageSizeSelect}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className={styles.tablesContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.reportsTable}>
              <thead>
                <tr>
                  <th className={styles.centered}>Numer zgłoszenia</th>
                  <th className={styles.centered}>Klient</th>
                  <th className={styles.centered}>Sprzęt</th>
                  <th className={styles.centered}>Status</th>
                  <th className={styles.centered}>Przyjął</th>
                  <th className={styles.centered}></th>
                </tr>
              </thead>
              <tbody>
                {getPaginated(reports, localPage).map((repair) => (
                    <React.Fragment key={repair.id}>
                      <tr>
                        <td className={styles.centered}>
                          <Link
                            href={`/reports/${repair.id}`}
                            className={styles.clientLink}
                          >
                            {repair.order_number || "-"}
                          </Link>
                        </td>
                        <td className={styles.centered}>
                          <Link
                            href={`/client-info?clientId=${repair.client_id}`}
                            className={styles.clientLink}
                          >
                            {repair.clients?.name || "-"}
                          </Link>
                        </td>
                        <td className={styles.centered}>
                          {repair.manufacturer} {repair.model}
                        </td>
                        <td
                          className={`${styles.statusCell} ${
                            styles[
                              `status-${repair.status
                                .replace(/([A-Z])/g, "_$1")
                                .toLowerCase()}`
                            ]
                          }`}
                        >
                          {statusLabels[repair.status] || repair.status}
                        </td>
                        <td className={styles.centered}>{repair.assigned_to || "-"}</td>
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
                        <tr ref={detailsRef}>
                          <td colSpan="6">
                            <div>
                              <strong>Numer zgłoszenia:</strong>{" "}
                              {repair.order_number || "-"}
                              <br />
                              <strong>Status:</strong>{" "}
                              <select
                                value={repair.status}
                                onChange={(e) =>
                                  handleStatusChange(repair.id, e.target.value)
                                }
                              >
                                {Object.entries(statusLabels).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                              <br />
                              <strong>Klient:</strong>{" "}
                              <Link
                                href={`/client-info?clientId=${repair.client_id}`}
                                className={styles.clientLink}
                              >
                                {repair.clients?.name || "-"}
                              </Link>
                              <br />
                              <strong>Typ sprzętu:</strong>{" "}
                              {repair.equipment_type}
                              <br />
                              <strong>Producent:</strong> {repair.manufacturer}
                              <br />
                              <strong>Model:</strong> {repair.model}
                              <br />
                              <strong>Numer seryjny:</strong>{" "}
                              {repair.serial_number}
                              <br />
                              <strong>Hasło:</strong>{" "}
                              {repair.password || "-"}
                              <br />
                              <strong>Zasilacz w zestawie:</strong>{" "}
                              {repair.power_adapter_included ? "Tak" : "Nie"}
                              <br />
                              <strong>Kopia danych:</strong>{" "}
                              {repair.data_backup_requested ? "Tak" : "Nie"}
                              <br />
                              <strong>Opis usterki:</strong>{" "}
                              {repair.issue_description}
                              <br />
                              <strong>Przyjął:</strong> {repair.assigned_to || "-"}
                              <br />
                              <strong>Data zgłoszenia:</strong>{" "}
                              {new Date(
                                repair.created_at
                              ).toLocaleDateString()}
                              <br />
                              {repair.status === "collected" &&
                                repair.collected_at && (
                                  <>
                                    <strong>Data zakończenia:</strong>{" "}
                                    {new Date(
                                      repair.collected_at
                                    ).toLocaleDateString()}
                                    <br />
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
            {getTotalPages(reports) > 1 && (
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
                {(() => {
                  const totalPages = getTotalPages(reports);
                  const maxVisiblePages = 7;
                  let startPage = Math.max(1, localPage - Math.floor(maxVisiblePages / 2));
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
                        disabled={localPage === 1}
                        className={localPage === 1 ? styles.activePage : ""}
                        onClick={() => setLocalPage(1)}
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
                        disabled={localPage === i}
                        className={localPage === i ? styles.activePage : ""}
                        onClick={() => setLocalPage(i)}
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
                        disabled={localPage === totalPages}
                        className={localPage === totalPages ? styles.activePage : ""}
                        onClick={() => setLocalPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                <button
                  disabled={localPage === getTotalPages(reports)}
                  onClick={() => setLocalPage(localPage + 1)}
                >
                  &gt;
                </button>
                <button
                  disabled={localPage === getTotalPages(reports)}
                  onClick={() => setLocalPage(getTotalPages(reports))}
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <ReportsPageContent />
    </Suspense>
  );
}
