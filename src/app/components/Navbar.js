'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.navLinks}>
          <Link href="/home" className={styles.navLink}>
            Strona główna
          </Link>
          <Link href="/reports" className={styles.navLink}>
            Zgłoszenia
          </Link>
          <Link href="/clients" className={styles.navLink}>
            Klienci
          </Link>
        </div>
        <div className={styles.navButtons}>
          <Link href="/add-report" className={styles.button}>
            Dodaj zgłoszenie
          </Link>
          <Link href="/add-client" className={styles.button}>
            Dodaj klienta
          </Link>
        </div>
      </div>
    </nav>
  );
} 