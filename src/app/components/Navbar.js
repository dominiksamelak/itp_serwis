'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef(null);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/reports?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(null);
    }
  };
  
  const closeDropdown = () => {
    setSearchResults(null);
    setSearchQuery('');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <ul className={styles.navLinks}>
          <li><Link href="/home" className={styles.navLink}>Strona główna</Link></li>
          <li><Link href="/reports" className={styles.navLink}>Zgłoszenia</Link></li>
          <li><Link href="/clients" className={styles.navLink}>Klienci</Link></li>
          {/* <li><Link href="/add-client" className={styles.button}>Dodaj klienta</Link></li> */}
          <li><Link href="/add-report" className={styles.button}>Dodaj zgłoszenie</Link></li>
        </ul>
        
        {/* Mobile Navigation Buttons */}
        <div className={styles.mobileNav}>
          <Link href="/reports" className={styles.mobileNavButton}>
            <span className={styles.mobileNavText}>Zgłoszenia</span>
          </Link>
          <Link href="/clients" className={styles.mobileNavButton}>
            <span className={styles.mobileNavText}>Klienci</span>
          </Link>
          <Link href="/add-report" className={styles.mobileNavButtonBlue}>
            <span className={styles.mobileNavText}>Dodaj zgłoszenie</span>
          </Link>
        </div>
        
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <input
            type="text"
            placeholder="Szukaj..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchSubmit}
            className={styles.searchInput}
          />
          {isSearching && <div className={styles.spinner}></div>}
          {searchResults && (
            <div className={styles.searchResults}>
              {searchResults.repairsByOrder.length > 0 && (
                <div className={styles.resultsSection}>
                  <h5>Zgłoszenia</h5>
                  {searchResults.repairsByOrder.map(r => (
                    <Link key={r.id} href={`/reports/${r.id}`} onClick={closeDropdown} className={styles.resultItem}>
                      <span><strong>Zgłoszenie:</strong> {r.order_number}</span>
                      <span><strong>Klient:</strong> {r.clients.name} ({r.clients.phone})</span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.clientsByName.length > 0 && (
                <div className={styles.resultsSection}>
                   <h5>Klienci wg. nazwy</h5>
                   {searchResults.clientsByName.map(c => (
                     <Link key={c.id} href={`/client-info?clientId=${c.id}`} onClick={closeDropdown} className={styles.resultItem}>
                        <span><strong>Klient:</strong> {c.name} ({c.phone})</span>
                        <span className={styles.resultDetails}>
                            <strong>Zgłoszenia:</strong> {c.equipment_repairs.map(r => r.order_number).join(', ')}
                        </span>
                     </Link>
                   ))}
                </div>
              )}
              {searchResults.clientsByPhone.length > 0 && (
                <div className={styles.resultsSection}>
                   <h5>Klienci wg. telefonu</h5>
                   {searchResults.clientsByPhone.map(c => (
                     <Link key={c.id} href={`/client-info?clientId=${c.id}`} onClick={closeDropdown} className={styles.resultItem}>
                        <span><strong>Klient:</strong> {c.name}</span>
                        <span className={styles.resultDetails}>
                            <strong>Ostatnie zgłoszenie:</strong> {c.newest_order_number}
                        </span>
                     </Link>
                   ))}
                </div>
              )}
              {searchResults.repairsByManufacturer && searchResults.repairsByManufacturer.length > 0 && (
                <div className={styles.resultsSection}>
                  <h5>Producent</h5>
                  {searchResults.repairsByManufacturer.map(r => (
                    <Link key={r.id} href={`/reports/${r.id}`} onClick={closeDropdown} className={styles.resultItem}>
                      <span><strong>Numer zgłoszenia:</strong> {r.order_number}</span>
                      <span><strong>Klient:</strong> {r.clients?.name || '-'} {r.clients?.phone ? `(${r.clients.phone})` : ''}</span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.repairsByEquipment && searchResults.repairsByEquipment.length > 0 && (
                <div className={styles.resultsSection}>
                  <h5>Sprzęt</h5>
                  {searchResults.repairsByEquipment.map(r => (
                    <Link key={r.id} href={`/reports/${r.id}`} onClick={closeDropdown} className={styles.resultItem}>
                      <span><strong>Numer zgłoszenia:</strong> {r.order_number}</span>
                      <span><strong>Klient:</strong> {r.clients?.name || '-'} {r.clients?.phone ? `(${r.clients.phone})` : ''}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {isSignedIn && (
          <div className={styles.userButtonContainer}>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
} 