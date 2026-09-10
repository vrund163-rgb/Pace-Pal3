import { useState } from 'react';
import type { Delivery } from '../types';

type Filter = 'all' | 'fastest' | 'slowest' | 'inswing' | 'outswing' | 'good_length' | 'yorker' | 'short' | 'high_confidence';

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All balls' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'slowest', label: 'Slowest' },
  { key: 'inswing', label: 'Inswing' },
  { key: 'outswing', label: 'Outswing' },
  { key: 'good_length', label: 'Good length' },
  { key: 'yorker', label: 'Yorker' },
  { key: 'short', label: 'Short' },
  { key: 'high_confidence', label: 'High confidence only' },
];

const W = 260;
const H = 460;
const PITCH_W = 180;

function laneX(line: number) {
  return W / 2 + line * 90;
}
function lengthY(length: number) {
  // 0m (batter stumps) at bottom, 20m (bowler stumps) at top
  return H - 30 - (length / 20.12) * (H - 60);
}

export function PitchMapChart({ deliveries, onSelect }: { deliveries: Delivery[]; onSelect?: (d: Delivery) => void }) {
  const [filter, setFilter] = useState<Filter>('all');

  const paces = deliveries.map(d => d.pace.value ?? 0);
  const maxPace = Math.max(...paces);
  const minPace = Math.min(...paces);
  const highConfPaces = deliveries.filter(d => (d.pace.confidence ?? 0) >= 85).map(d => d.pace.value ?? 0);
  const reliableFastest = highConfPaces.length ? Math.max(...highConfPaces) : null;

  const filtered = deliveries.filter(d => {
    switch (filter) {
      case 'fastest': return (d.pace.value ?? 0) === maxPace;
      case 'slowest': return (d.pace.value ?? 0) === minPace;
      case 'inswing': return d.swing.direction === 'inswing';
      case 'outswing': return d.swing.direction === 'outswing';
      case 'good_length': return d.lengthClass === 'good_length';
      case 'yorker': return d.lengthClass === 'yorker';
      case 'short': return d.lengthClass === 'short' || d.lengthClass === 'short_of_length';
      case 'high_confidence': return (d.pace.confidence ?? 0) >= 85;
      default: return true;
    }
  });

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-sm px-2.5 py-1 font-mono text-xs transition-colors border ${
              filter === f.key
                ? 'bg-seam-500/15 border-seam-500/50 text-chalk-100'
                : 'border-turf-700 text-slateg-400 hover:text-chalk-300 hover:border-turf-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {reliableFastest !== null && (
        <p className="mb-3 font-mono text-xs text-slateg-400">
          Highest estimated reading: {maxPace} km/h ({deliveries.find(d => d.pace.value === maxPace)?.pace.confidence}% confidence) ·
          Most reliable fastest: {reliableFastest} km/h (high confidence)
        </p>
      )}

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs h-auto">
          <rect x={W / 2 - PITCH_W / 2} y={20} width={PITCH_W} height={H - 40} fill="#1A251E" stroke="#324A38" />
          {/* stumps */}
          <line x1={W / 2 - 12} y1={26} x2={W / 2 + 12} y2={26} stroke="#DAD4C4" strokeWidth={3} />
          <line x1={W / 2 - 12} y1={H - 26} x2={W / 2 + 12} y2={H - 26} stroke="#DAD4C4" strokeWidth={3} />
          {/* crease lines */}
          <line x1={W / 2 - PITCH_W / 2} y1={lengthY(0)} x2={W / 2 + PITCH_W / 2} y2={lengthY(0)} stroke="#4C7A3F" strokeDasharray="3 3" />
          {/* length zone labels */}
          <text x={W / 2 - PITCH_W / 2 - 6} y={lengthY(2)} fill="#7C8680" fontSize={8} fontFamily="IBM Plex Mono" textAnchor="end">Yorker</text>
          <text x={W / 2 - PITCH_W / 2 - 6} y={lengthY(7)} fill="#7C8680" fontSize={8} fontFamily="IBM Plex Mono" textAnchor="end">Good</text>
          <text x={W / 2 - PITCH_W / 2 - 6} y={lengthY(11)} fill="#7C8680" fontSize={8} fontFamily="IBM Plex Mono" textAnchor="end">Short</text>

          {filtered.map(d => {
            const cx = laneX(d.line.value ?? 0);
            const cy = lengthY(d.length.value ?? 10);
            const conf = d.pace.confidence ?? 0;
            const color = conf >= 85 ? '#4C7A3F' : conf >= 60 ? '#D9A441' : '#B33027';
            return (
              <g key={d.id} onClick={() => onSelect?.(d)} className={onSelect ? 'cursor-pointer' : ''}>
                <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.85} stroke="#F5F1E7" strokeWidth={1} />
                <text x={cx} y={cy + 3} fontSize={7} fill="#0D1310" fontFamily="IBM Plex Mono" textAnchor="middle" fontWeight={600}>
                  {d.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 font-mono text-xs text-slateg-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-turf-500" /> High confidence</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-seam-500" /> Low</span>
      </div>
    </div>
  );
}
