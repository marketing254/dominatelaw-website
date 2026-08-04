'use client';
import { useEffect, useState } from 'react';

// Legacy scroll progress bar + back-to-top button (ported from index.html inline JS).
export default function HomeExtras() {
  const [progress, setProgress] = useState(0);
  const [showBtt, setShowBtt] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      setProgress(denom > 0 ? (h.scrollTop / denom) * 100 : 0);
      setShowBtt(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div id="progress" style={{ width: `${progress}%` }} />
      <button
        id="btt"
        className={showBtt ? 'show' : ''}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </>
  );
}
