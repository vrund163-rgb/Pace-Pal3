import { useState } from 'react';
import type { Delivery } from '../types';

const views = ["Bowler's end", "Batter's end / umpire", 'Side-on', 'Original camera'] as const;

const W = 460;
const H = 300;

export function UmpireViewPanel({ delivery }: { delivery: Delivery }) {
  const [view, setView] = useState<(typeof views)[number]>("Batter's end / umpire");

  const stumpsX = W / 2;
  const stumpsY = 58;
  const creaseY = 84;

  // Project trajectory onto a front-on plane: x = lateral, y = height, depth = distance (used for scale)
  const points = delivery.trajectory.map(p => {
    const depthT = p.y / 20.12; // 0 near bowler stumps -> 1 near batter
    const scale = 0.35 + depthT * 0.75; // closer to viewer = bigger
    const px = stumpsX + p.x * 120 * scale;
    const py = H - 40 - p.z * 70 * scale;
    return { px, py, depthT };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');
  const bounce = points[Math.round(points.length * 0.6)];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {views.map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-sm px-2.5 py-1 font-mono text-xs border transition-colors ${
              view === v ? 'bg-seam-500/15 border-seam-500/50 text-chalk-100' : 'border-turf-700 text-slateg-400 hover:text-chalk-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'Original camera' ? (
        <div className="flex aspect-video items-center justify-center rounded-sm border border-dashed border-turf-600 bg-turf-950">
          <p className="font-mono text-xs text-slateg-400 px-6 text-center">
            Original camera footage appears here once video storage is connected.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-turf-700 bg-turf-900 pitch-texture">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* stumps */}
            {[-14, 0, 14].map(dx => (
              <rect key={dx} x={stumpsX + dx - 1.5} y={stumpsY} width={3} height={26} fill="#DAD4C4" />
            ))}
            <rect x={stumpsX - 17} y={stumpsY - 4} width={34} height={4} fill="#DAD4C4" />
            {/* crease */}
            <line x1={stumpsX - 70} y1={creaseY} x2={stumpsX + 70} y2={creaseY} stroke="#4C7A3F" strokeWidth={2} />
            {/* trajectory */}
            <path d={pathD} fill="none" stroke="#B33027" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
            <circle cx={bounce.px} cy={bounce.py} r={4} fill="#D9A441" />
            <text x={bounce.px + 8} y={bounce.py - 4} fontSize={11} fill="#DAD4C4" fontFamily="IBM Plex Mono">Bounce</text>
          </svg>
        </div>
      )}
      <p className="mt-3 font-body text-xs leading-relaxed text-slateg-400">
        This is a visual reconstruction for analysis, not a certified decision-review output — it doesn't
        determine LBW or dismissal outcomes.
      </p>
    </div>
  );
}
