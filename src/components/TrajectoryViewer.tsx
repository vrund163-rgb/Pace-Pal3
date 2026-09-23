import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import type { TrajectoryPoint } from '../types';
import { project } from '../lib/projection';

export function TrajectoryViewer({ trajectory }: { trajectory: TrajectoryPoint[] }) {
  const [angle, setAngle] = useState(35);
  const bounceIdx = trajectory.reduce(
    (best, p, i) => (p.z < trajectory[best].z && i > trajectory.length * 0.4 ? i : best),
    0
  );

  const originX = 260;
  const originY = 190;

  const toScreen = (p: TrajectoryPoint) => {
    const { screenX, screenY } = project(p.x, p.y - 10, p.z, angle);
    return { x: originX + screenX, y: originY + screenY };
  };

  const pathPoints = trajectory.filter(p => !p.occluded);
  const pathD = pathPoints
    .map((p, i) => {
      const { x, y } = toScreen(p);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // ground plane grid
  const gridLines = [];
  for (let gy = -10; gy <= 10.12; gy += 2) {
    const a = project(-1.5, gy, 0, angle);
    const b = project(1.5, gy, 0, angle);
    gridLines.push(
      <line
        key={`g-${gy}`}
        x1={originX + a.screenX}
        y1={originY + a.screenY}
        x2={originX + b.screenX}
        y2={originY + b.screenY}
        stroke="#243428"
        strokeWidth={1}
      />
    );
  }

  const release = toScreen(trajectory[0]);
  const bounce = toScreen(trajectory[bounceIdx]);
  const end = toScreen(trajectory[trajectory.length - 1]);

  return (
    <div>
      <div className="relative rounded-sm border border-turf-700 bg-turf-900 pitch-texture">
        <svg viewBox="0 0 520 320" className="w-full h-auto">
          <g>{gridLines}</g>
          <path d={pathD} fill="none" stroke="#B33027" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={release.x} cy={release.y} r={4} fill="#D9A441" />
          <text x={release.x + 8} y={release.y - 6} fill="#DAD4C4" fontSize={11} fontFamily="IBM Plex Mono">Release</text>
          <circle cx={bounce.x} cy={bounce.y} r={4} fill="#F5F1E7" />
          <text x={bounce.x + 8} y={bounce.y - 6} fill="#DAD4C4" fontSize={11} fontFamily="IBM Plex Mono">Bounce</text>
          <circle cx={end.x} cy={end.y} r={4} fill="#4C7A3F" />
          <text x={end.x + 8} y={end.y - 6} fill="#DAD4C4" fontSize={11} fontFamily="IBM Plex Mono">Batter</text>
          {trajectory.filter(p => p.occluded).map((p, i) => {
            const s = toScreen(p);
            return <circle key={i} cx={s.x} cy={s.y} r={2.5} fill="none" stroke="#7C8680" strokeDasharray="2 2" />;
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <RotateCw size={14} className="text-slateg-400" />
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={e => setAngle(Number(e.target.value))}
          className="flex-1 accent-seam-500"
          aria-label="Rotate trajectory view"
        />
        <span className="font-mono text-xs text-slateg-400 w-10 text-right">{angle}°</span>
      </div>
      <p className="mt-2 font-mono text-xs text-slateg-400">
        Hollow markers indicate frames where the ball was occluded and the path was bridged by trajectory prediction.
      </p>
    </div>
  );
}
