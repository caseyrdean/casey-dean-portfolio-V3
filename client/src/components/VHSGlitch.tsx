import { useEffect, useState } from 'react';

/* VHS Glitch Effect Component
 * Creates a pronounced analog distortion effect every 30 seconds
 * Mimics old VHS tape artifacts: scanlines, color separation, horizontal shift
 */

export default function VHSGlitch() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Trigger glitch every 30 seconds
    const interval = setInterval(() => {
      setIsGlitching(true);
      // Glitch lasts 600ms - more pronounced
      setTimeout(() => setIsGlitching(false), 600);
    }, 30000);

    // Initial glitch after 3 seconds to show it's working
    const initialTimeout = setTimeout(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 600);
    }, 3000);

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
      <div className="vhs-noise-bar vhs-noise-bar-3" />
      {/* Static noise */}
      <div className="vhs-static" />
      {/* Screen shake effect */}
      <div className="vhs-shake" />
    </div>
  );
}
