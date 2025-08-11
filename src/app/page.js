"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isMobileDevice } from "./utils/mobileDetection";

export default function Home() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      
      // Redirect based on device type
      if (mobile) {
        router.push('/reports');
      } else {
        router.push('/home');
      }
      
      setIsLoading(false);
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div>Przekierowywanie...</div>
      {isLoading && <div style={{ fontSize: '14px', color: '#999' }}>
        Wykrywanie urządzenia...
      </div>}
    </div>
  );
}
