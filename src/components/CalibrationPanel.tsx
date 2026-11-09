import { useRef, useState } from 'react';
import { getFrameUrl, submitCalibration } from '../lib/api';

type Mode = 'creases' | 'stumps';

const KEYS = ['bowlerLeft', 'bowlerRight', 'batterLeft', 'batterRight'] as const;

const LABELS: Record<Mode, string[]> = {
  creases: [
    'Bowler\u2019s end — LEFT outer end of the bowling crease',
    'Bowler\u2019s end — RIGHT outer end of the bowling crease',
    'Batter\u2019s end — LEFT outer end of the bowling crease',
    'Batter\u2019s end — RIGHT outer end of the bowling crease',
  ],
  stumps: [
    'Bowler\u2019s end — base of the LEFT outer stump',
    'Bowler\u2019s end — base of the RIGHT outer stump',
    'Batter\u2019s end — base of the LEFT outer stump',
    'Batter\u2019s end — base of the RIGHT outer stump',
  ],
};

export function CalibrationPanel({ sessionId, onDone }: { sessionId: string; onDone: (result: any) => void }) {
  const [mode, setMode] = useState<Mode>('creases');
  const [points, setPoints] = useState<Record<string, [number, number]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const nextKeyIndex = KEYS.findIndex(k => !(k in points));
  const nextStep = nextKeyIndex >= 0 ? { key: KEYS[nextKeyIndex], label: LABELS[mode][nextKeyIndex] } : undefined;

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!nextStep || !imgRef.current) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);
    setPoints(prev => ({ ...prev, [nextStep.key]: [x, y] }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      onDone(await submitCalibration(sessionId, { mode, ...(points as any) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Calibrate</div>
      <p className="mt-1 font-body text-sm text-chalk-300">
        Click 4 points on the frame below, in order. This lets Pace Pal convert pixel positions into real metres
        for line and length (pace still isn&apos;t possible from one camera).
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['creases', 'stumps'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setPoints({}); }}
            className={`rounded-sm border px-2.5 py-1 font-mono text-xs transition-colors ${
              mode === m ? 'border-seam-500/50 bg-seam-500/15 text-chalk-100' : 'border-turf-700 text-slateg-400 hover:text-chalk-300'
            }`}
          >
            {m === 'creases' ? 'Crease corners (recommended)' : 'Stumps (less accurate)'}
          </button>
        ))}
      </div>

      {mode === 'creases' ? (
        <p className="mt-2 font-body text-xs leading-relaxed text-slateg-400">
          The bowling crease is the white line the stumps stand on. At each end, click the two corners where it
          meets the return crease (the short white lines running along the pitch). These points are 2.64 m apart, so
          a click that&apos;s a few pixels off barely matters.
        </p>
      ) : (
        <p className="mt-2 font-body text-xs leading-relaxed text-amber-500">
          Only use this if your pitch has no crease lines. At the far end the two stumps are only a few pixels apart in
          the video, so small click errors can make the length wrong by several metres.
        </p>
      )}

      <div className="mt-3 font-mono text-sm text-amber-500">
        {nextStep ? `Click: ${nextStep.label}` : 'All 4 points marked.'}
      </div>

      <div className="relative mt-3 inline-block max-w-full">
        <img
          ref={imgRef}
          src={getFrameUrl(sessionId)}
          onClick={handleClick}
          className="max-w-full cursor-crosshair rounded-sm border border-turf-700"
          alt="Video frame for calibration"
        />
        {imgRef.current &&
          Object.entries(points).map(([key, [px, py]]) => {
            const img = imgRef.current!;
            const rect = img.getBoundingClientRect();
            return (
              <div
                key={key}
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-seam-500 bg-seam-500/50"
                style={{ left: (px / img.naturalWidth) * rect.width, top: (py / img.naturalHeight) * rect.height }}
              />
            );
          })}
      </div>

      {Object.keys(points).length === 4 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 rounded-sm bg-seam-500 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-seam-400 disabled:opacity-40 transition-colors"
        >
          {submitting ? 'Calibrating…' : 'Submit calibration'}
        </button>
      )}
      {Object.keys(points).length > 0 && (
        <button onClick={() => setPoints({})} className="mt-4 ml-3 font-mono text-xs text-slateg-400 underline hover:text-chalk-300">
          Reset points
        </button>
      )}
      {error && <p className="mt-3 font-body text-sm text-seam-400">{error}</p>}
    </div>
  );
}
