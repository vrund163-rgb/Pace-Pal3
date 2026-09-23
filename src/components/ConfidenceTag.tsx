import type { ConfidenceLevel } from '../types';

const styles: Record<ConfidenceLevel, string> = {
  high: 'text-turf-500 border-turf-500/40 bg-turf-500/10',
  medium: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
  low: 'text-seam-400 border-seam-400/40 bg-seam-400/10',
  insufficient: 'text-slateg-400 border-slateg-400/40 bg-slateg-400/10',
};

const labels: Record<ConfidenceLevel, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
  insufficient: 'Insufficient data',
};

export function ConfidenceTag({ level, score }: { level: ConfidenceLevel; score: number | null }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-mono ${styles[level]}`}>
      {score !== null ? `${score}%` : labels[level]}
    </span>
  );
}
