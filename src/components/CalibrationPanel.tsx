import { useRef, useState } from 'react';
import { getFrameUrl, submitCalibration } from '../lib/api';

const STEPS = [
  { key: 'bowlerLeft', label: 'Bowler-end stumps — left edge' },
  { key: 'bowlerRight', label: 'Bowler-end stumps — right edge' },
  { key: 'batterLeft', label: 'Batter-end stumps — left edge' },
  { key: 'batterRight', label: 'Batter-end stumps — right edge' },
] as const;

export function CalibrationPanel({ sessionId, onDone }: { sessionId: string; onDone: (result: any) => void }) {
  const [points, setPoints] = useState<Record<string, [number, number]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const nextStep = STEPS.find(s => !(s.key in points));

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
      onDone(await submitCalibration(sessionId, points as any));
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
        Click the 4 stump points on the frame below, in order. This lets Pace Pal convert pixel
        positions into real metres for line and length (pace still isn't possible from one camera).
      </p>
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
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-seam-500 bg-seam-500/50"
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
