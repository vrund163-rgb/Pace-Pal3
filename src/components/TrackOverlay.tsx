import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { getFrameUrl } from '../lib/api';
import { invert3x3, applyHomography } from '../lib/homographyMath';

interface Pt { frame: number; t: number; x: number; y: number; confidence: number }

const PITCH_HALF_WIDTH_M = 1.525; // a cricket pitch strip is 3.05 m wide
const PITCH_LENGTH_M = 20.12;

export function TrackOverlay({
  sessionId,
  trajectory,
  homography,
  calibratedResult,
}: {
  sessionId: string;
  trajectory: Pt[];
  homography: number[] | null;
  calibratedResult: {
    lineM: number | null; lengthM: number | null;
    bounceX: number | null; bounceY: number | null;
    bounceConfidence: 'clear' | 'weak' | 'none';
  } | null;
}) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [shown, setShown] = useState(trajectory.length);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setShown(trajectory.length);
  }, [trajectory.length]);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const pts = [...trajectory].sort((a, b) => a.frame - b.frame);

  function replay() {
    if (timer.current) window.clearInterval(timer.current);
    setShown(0);
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= pts.length && timer.current) window.clearInterval(timer.current);
    }, 160);
  }

  const W = size?.w ?? 1;
  const H = size?.h ?? 1;
  const font = W * 0.024;
  const visible = pts.slice(0, shown);

  // Break the line wherever the ball wasn't seen for a while, so we never draw a line through a gap.
  const typicalGap = pts.length > 1 ? Math.min(...pts.slice(1).map((p, i) => p.frame - pts[i].frame).filter(g => g > 0)) : 1;
  const segments: Pt[][] = [];
  visible.forEach((p, i) => {
    if (i === 0 || p.frame - visible[i - 1].frame > typicalGap * 3) segments.push([p]);
    else segments[segments.length - 1].push(p);
  });

  // Pitch outline from the calibration (only if calibrated).
  let pitchPolygon: string | null = null;
  let centreLine: [number, number, number, number] | null = null;
  if (homography && homography.length === 9) {
    const inv = invert3x3(homography);
    if (inv) {
      const corners = [
        [-PITCH_HALF_WIDTH_M, 0], [PITCH_HALF_WIDTH_M, 0],
        [PITCH_HALF_WIDTH_M, PITCH_LENGTH_M], [-PITCH_HALF_WIDTH_M, PITCH_LENGTH_M],
      ].map(([x, y]) => applyHomography(inv, x, y));
      pitchPolygon = corners.map(c => c.join(',')).join(' ');
      const a = applyHomography(inv, 0, 0);
      const b = applyHomography(inv, 0, PITCH_LENGTH_M);
      centreLine = [a[0], a[1], b[0], b[1]];
    }
  }

  const bounce = calibratedResult && calibratedResult.bounceX != null && calibratedResult.bounceY != null && calibratedResult.lineM != null
    ? { x: calibratedResult.bounceX, y: calibratedResult.bounceY }
    : undefined;
  const weak = calibratedResult?.bounceConfidence === 'weak';
  const first = pts[0];

  const label = (x: number, y: number, text: string, anchorRight = false) => {
    const tw = text.length * font * 0.64 + font * 0.8;
    const th = font * 1.5;
    let lx = anchorRight ? x - tw - font * 0.6 : x + font * 0.6;
    lx = Math.max(4, Math.min(lx, W - tw - 4));
    const ly = Math.max(th + 4, Math.min(y, H - 4));
    return (
      <g>
        <rect x={lx} y={ly - th} width={tw} height={th} rx={font * 0.2} fill="#0D1310" fillOpacity={0.85} stroke="#324A38" />
        <text x={lx + font * 0.4} y={ly - th * 0.3} fill="#F5F1E7" fontSize={font} fontFamily="IBM Plex Mono, monospace">{text}</text>
      </g>
    );
  };

  return (
    <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Tracked path</div>
        {pts.length > 1 && (
          <button
            onClick={replay}
            className="flex items-center gap-1.5 rounded-sm border border-turf-600 px-2.5 py-1 font-mono text-xs text-chalk-300 hover:text-chalk-100 hover:border-turf-500 transition-colors"
          >
            <Play size={12} /> Replay
          </button>
        )}
      </div>

      <div className="relative mt-3 inline-block max-w-full">
        <img
          src={getFrameUrl(sessionId)}
          alt="Video frame with the tracked ball path drawn on it"
          className="max-w-full rounded-sm border border-turf-700"
          onLoad={e => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
        {size && (
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full pointer-events-none">
            {pitchPolygon && (
              <>
                <polygon points={pitchPolygon} fill="#4C7A3F" fillOpacity={0.12} stroke="#4C7A3F" strokeWidth={W * 0.002} />
                {centreLine && (
                  <line x1={centreLine[0]} y1={centreLine[1]} x2={centreLine[2]} y2={centreLine[3]}
                    stroke="#DAD4C4" strokeOpacity={0.5} strokeWidth={W * 0.0015} strokeDasharray={`${W * 0.008} ${W * 0.008}`} />
                )}
              </>
            )}

            {segments.map((seg, i) =>
              seg.length > 1 ? (
                <polyline key={i} points={seg.map(p => `${p.x},${p.y}`).join(' ')} fill="none"
                  stroke="#B33027" strokeWidth={W * 0.004} strokeLinecap="round" strokeLinejoin="round" />
              ) : null
            )}
            {visible.map(p => (
              <circle key={p.frame} cx={p.x} cy={p.y} r={W * 0.006} fill="#B33027" stroke="#F5F1E7" strokeWidth={W * 0.0012}
                fillOpacity={0.5 + 0.5 * Math.min(1, p.confidence)} />
            ))}

            {first && shown > 0 && <>
              <circle cx={first.x} cy={first.y} r={W * 0.009} fill="none" stroke="#D9A441" strokeWidth={W * 0.003} />
              {label(first.x, first.y - font * 0.4, 'First seen')}
            </>}
            {bounce && calibratedResult && shown >= pts.length && <>
              <circle cx={bounce.x} cy={bounce.y} r={W * 0.011} fill={weak ? 'none' : '#D9A441'} stroke={weak ? '#D9A441' : '#0D1310'} strokeWidth={W * 0.003} />
              {label(bounce.x, bounce.y + font * 2.6, `${weak ? 'Bounce (low confidence)' : 'Bounce'}  line ${calibratedResult.lineM} m · length ${calibratedResult.lengthM} m`, true)}
            </>}
          </svg>
        )}
      </div>

      <p className="mt-3 font-mono text-xs leading-relaxed text-slateg-400">
        Each dot is a frame where the ball was found; fainter dots are lower-confidence detections. Lines break where the
        ball wasn't seen. A stray dot far from the path is a wrong detection, not the ball.
        {pitchPolygon ? ' The green outline is the pitch as your calibration sees it. If it doesn’t sit on the real pitch, recalibrate.' : ''}
      </p>
    </div>
  );
}
