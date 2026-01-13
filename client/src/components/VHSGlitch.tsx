import { useEffect, useState } from 'react';

/* VHS Glitch Effect Component
 * Creates a subtle analog distortion effect every 60 seconds
 * Mimics old VHS tape artifacts: scanlines, color separation, horizontal shift
 */

export default function VHSGlitch() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Trigger glitch every 60 seconds
    const interval = setInterval(() => {
      setIsGlitching(true);
      // Glitch lasts 300ms - fast and subtle
      setTimeout(() => setIsGlitching(false), 300);
    }, 60000);

    // Initial glitch after 5 seconds to show it's working
    const initialTimeout = setTimeout(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!isGlitching) return null;

  return (
    <div className="vhs-glitch-overlay" aria-hidden="true">
      {/* Scanline distortion */}
      <div className="vhs-scanlines" />
      {/* Color separation / chromatic aberration */}
      <div className="vhs-rgb-shift" />
      {/* Horizontal noise bars */}
      <div className="vhs-noise-bar vhs-noise-bar-1" />
      <div className="vhs-noise-bar vhs-noise-bar-2" />
      {/* Static noise */}
      <div className="vhs-static" />
    </div>
  );
}
