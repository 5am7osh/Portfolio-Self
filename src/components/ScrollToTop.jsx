'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top instantly on route change, EXCEPT when going back to the main homepage
    // so the browser can natively restore scroll to the "Systems Built" section
    if (pathname === '/') return;
    
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
