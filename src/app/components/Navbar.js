import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        <Link href="/home" className={styles.navLink}>
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
    </nav>
  );
} 