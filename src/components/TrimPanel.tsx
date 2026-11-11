import { useState } from 'react';
import { trimPath } from '../lib/api';

export function TrimPanel({
  sessionId, fullFirst, fullLast, range, onRange, onApplied,
}: {
  sessionId: string; fullFirst: number; fullLast: number;
  range: [number, number]; onRange: (r: [number, number]) => void; onApplied: (session: any) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [a, b] = range;

  async function apply(r: [number, number]) {
    setBusy(true); setError('');
    try { onApplied(await trimPath(sessionId, r[0], r[1])); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }

  return (
    <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Trim the path</div>
      <p className="mt-1 font-body text-xs leading-relaxed text-slateg-400">
        If the tracker followed something else before the ball appeared or after it left, drag the two sliders so only
        the real flight is kept. Points outside turn grey in the picture above. Then press Apply.
      </p>
      <div className="mt-3 space-y-2 font-mono text-xs text-slateg-400">
        <label className="flex items-center gap-3">
          <span className="w-24 shrink-0">Start: frame {a}</span>
          <input type="range" min={fullFirst} max={fullLast} value={a} className="flex-1 accent-seam-500"
            onChange={e => onRange([Math.min(Number(e.target.value), b - 1), b])} aria-label="First frame to keep" />
        </label>
        <label className="flex items-center gap-3">
          <span className="w-24 shrink-0">End: frame {b}</span>
          <input type="range" min={fullFirst} max={fullLast} value={b} className="flex-1 accent-seam-500"
            onChange={e => onRange([a, Math.max(Number(e.target.value), a + 1)])} aria-label="Last frame to keep" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => apply(range)} disabled={busy}
          className="rounded-sm bg-seam-500 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-seam-400 disabled:opacity-40 transition-colors">
          {busy ? 'Applying…' : 'Apply trim'}
        </button>
        <button onClick={() => { onRange([fullFirst, fullLast]); apply([fullFirst, fullLast]); }} disabled={busy}
          className="font-mono text-xs text-slateg-400 underline hover:text-chalk-300">Reset (keep everything)</button>
      </div>
      {error && <p className="mt-2 font-body text-sm text-seam-400">{error}</p>}
    </div>
  );
}
