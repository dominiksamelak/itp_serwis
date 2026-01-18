"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import EquipmentReceiptPrint from "../../components/EquipmentReceiptPrint";
import { supabase } from "../../utils/supabaseClients";
import styles from "./page.module.css";

export default function PrintReceiptPage() {
  const { reportId } = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (reportId) {
      const fetchRepair = async () => {
        try {
          const { data, error } = await supabase
            .from("equipment_repairs")
            .select("*, clients(*)")
            .eq("id", reportId)
            .single();

          if (error) throw error;
          setRepair(data);
        } catch (err) {
          console.error("Error fetching repair:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRepair();
    }
  }, [reportId]);

  useEffect(() => {
    if (!loading && repair && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, repair]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    router.push(`/reports/${reportId}`);
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!repair || !repair.clients) {
    return <div>Nie znaleziono naprawy.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.buttonContainer}>
        <button onClick={handlePrint} className={styles.printButton}>
          Drukuj
        </button>
        <button onClick={handleClose} className={styles.closeButton}>
          Zamknij
        </button>
      </div>
      <div className={styles.documentContainer}>
        <EquipmentReceiptPrint
          client={repair.clients}
          equipment={repair}
          orderNumber={repair.order_number || `RMA/${repair.id}`}
        />
      </div>
    </div>
  );
}
