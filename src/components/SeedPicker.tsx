import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getFrameUrl, trackFromPoint } from '../lib/api';

type Direction = 'both' | 'forward' | 'backward';

export function SeedPicker({
  sessionId,
  frameCount,
  fps,
  intro,
  onStarted,
}: {
  sessionId: string;
  frameCount: number;
  fps: number;
  intro: string;
  onStarted: () => void;
}) {
  const maxIdx = Math.max(1, (frameCount || 600) - 1);
  const [idx, setIdx] = useState(Math.floor(maxIdx / 2));
  const [shownIdx, setShownIdx] = useState(idx);
  const [pt, setPt] = useState<{ frame: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState<Direction>('both');
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [, force] = useState(0);

  // Wait a moment after the slider stops moving before fetching the frame image.
  useEffect(() => {
    const t = window.setTimeout(() => { setShownIdx(idx); setLoadError(false); }, 120);
    return () => window.clearTimeout(t);
  }, [idx]);

  const step = (d: number) => setIdx(i => Math.min(maxIdx, Math.max(0, i + d)));

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    setPt({
      frame: shownIdx,
      x: (e.clientX - rect.left) * (img.naturalWidth / rect.width),
      y: (e.clientY - rect.top) * (img.naturalHeight / rect.height),
    });
  }

  async function start() {
    if (!pt) return;
    setSubmitting(true);
    setError('');
    try {
      await trackFromPoint(sessionId, { frame: pt.frame, x: pt.x, y: pt.y, direction });
      onStarted();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  const img = imgRef.current;
  const marker =
    pt && pt.frame === shownIdx && img && img.naturalWidth
      ? { left: (pt.x / img.naturalWidth) * 100, top: (pt.y / img.naturalHeight) * 100 }
      : null;

  const btn = 'rounded-sm border border-turf-700 p-1.5 text-slateg-400 hover:text-chalk-100 hover:border-turf-600 transition-colors';

  return (
    <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Click the ball yourself</div>
      <p className="mt-1 font-body text-sm text-chalk-300">{intro}</p>
      <ol className="mt-2 list-decimal space-y-0.5 pl-5 font-body text-xs leading-relaxed text-slateg-400">
        <li>Use the slider or arrows to find a frame where you can clearly see the ball (just after release is ideal).</li>
        <li>Zoom in if it&apos;s tiny, then click the centre of the ball.</li>
        <li>Press &ldquo;Track from here&rdquo;. It follows the ball both ways from that frame.</li>
      </ol>

      <div className="mt-4 flex items-center gap-2">
        <button className={btn} onClick={() => step(-10)} aria-label="Back 10 frames"><ChevronsLeft size={14} /></button>
        <button className={btn} onClick={() => step(-1)} aria-label="Back 1 frame"><ChevronLeft size={14} /></button>
        <input
          type="range" min={0} max={maxIdx} value={idx}
          onChange={e => setIdx(Number(e.target.value))}
          className="flex-1 accent-seam-500"
          aria-label="Choose a video frame"
        />
        <button className={btn} onClick={() => step(1)} aria-label="Forward 1 frame"><ChevronRight size={14} /></button>
        <button className={btn} onClick={() => step(10)} aria-label="Forward 10 frames"><ChevronsRight size={14} /></button>
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-xs text-slateg-400">
        <span>Frame {idx} of {maxIdx}{fps ? ` · ${(idx / fps).toFixed(2)} s` : ''}</span>
        <span className="flex items-center gap-1.5">
          Zoom
          {[1, 2, 3].map(z => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`rounded-sm border px-1.5 py-0.5 ${zoom === z ? 'border-seam-500/50 bg-seam-500/15 text-chalk-100' : 'border-turf-700 hover:text-chalk-300'}`}
            >
              {z}×
            </button>
          ))}
        </span>
      </div>

      <div className="mt-3 max-h-[70vh] overflow-auto rounded-sm border border-turf-700 bg-turf-950">
        <div className="relative" style={{ width: `${zoom * 100}%` }}>
          <img
            ref={imgRef}
            src={getFrameUrl(sessionId, shownIdx)}
            alt={`Video frame ${shownIdx}`}
            onClick={handleClick}
            onLoad={() => { setLoadError(false); force(n => n + 1); }}
            onError={() => setLoadError(true)}
            className="block w-full cursor-crosshair"
            draggable={false}
          />
          {marker && (
            <div
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-500"
              style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
            />
          )}
        </div>
      </div>
      {loadError && <p className="mt-2 font-mono text-xs text-seam-400">Couldn&apos;t load this frame. It may be past the end of the video.</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={direction}
          onChange={e => setDirection(e.target.value as Direction)}
          className="rounded-sm border border-turf-700 bg-turf-950 px-2 py-1.5 font-mono text-xs text-chalk-100"
          aria-label="Tracking direction"
        >
          <option value="both">Track both ways (recommended)</option>
          <option value="forward">Forward only</option>
          <option value="backward">Backward only</option>
        </select>
        <button
          onClick={start}
          disabled={!pt || submitting}
          className="rounded-sm bg-seam-500 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-seam-400 disabled:opacity-40 transition-colors"
        >
          {submitting ? 'Starting…' : 'Track from here'}
        </button>
        {!pt && <span className="font-mono text-xs text-amber-500">Click the ball first.</span>}
        {pt && pt.frame !== shownIdx && (
          <span className="font-mono text-xs text-slateg-400">Your click is on frame {pt.frame}; tracking starts there.</span>
        )}
      </div>
      {error && <p className="mt-3 font-body text-sm text-seam-400">{error}</p>}
    </div>
  );
}
