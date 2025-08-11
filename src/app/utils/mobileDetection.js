export const isMobileDevice = () => {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  
  // Check for mobile user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Mobile device detection patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i,
    /Tablet/i
  ];
  
  // Check if any mobile pattern matches
  const isMobileByUserAgent = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Also check screen width as a fallback
  const isMobileByScreen = window.innerWidth <= 768;
  
  return isMobileByUserAgent || isMobileByScreen;
};

export const getScreenSize = () => {
  if (typeof window === 'undefined') {
    return 'desktop'; // Server-side rendering
  }
  
  const width = window.innerWidth;
  
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  return 'desktop';
}; 