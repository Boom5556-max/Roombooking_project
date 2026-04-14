import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * PageReveal Component
 * Standardizes the "Premium Reveal Animation" across all pages.
 * 
 * @param {boolean} isLoading - The primary loading state from API hooks.
 * @param {string} loadingText - Text to display in the spinner.
 * @param {number} delay - Local "Paint-Guard" delay in ms (default 800ms).
 * @param {React.ReactNode} children - Page content.
 */
const PageReveal = ({ 
  isLoading, 
  children, 
  loadingText = "กำลังโหลดข้อมูล...", 
  delay = 400 
}) => {
  const [isFullyReady, setIsFullyReady] = useState(false);

  useEffect(() => {
    let timeout;
    if (!isLoading) {
      // 🛡️ Paint-Guard: Ensure the browser has painted the complex UI before revealing.
      timeout = setTimeout(() => {
        setIsFullyReady(true);
      }, delay);
    } else {
      // If isLoading becomes true again (e.g. room change), reset visibility
      setIsFullyReady(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading, delay]);

  // Handle Safety Watchdog: If for some reason it's stuck for 5 seconds, force show.
  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (!isFullyReady && !isLoading) setIsFullyReady(true);
    }, 5000);
    return () => clearTimeout(watchdog);
  }, [isFullyReady, isLoading]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* 1. Loading Overlay Layer */}
      {!isFullyReady && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-auto">
           <LoadingSpinner fullPage text={loadingText} />
        </div>
      )}

      {/* 2. Content Layer with Premium Reveal Classes */}
      <div 
        className={`w-full h-full flex flex-col ${
          isFullyReady ? 'premium-reveal-visible' : 'premium-reveal-hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageReveal;
