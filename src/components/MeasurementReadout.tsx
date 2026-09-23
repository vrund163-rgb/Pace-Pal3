import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Measurement } from '../types';
import { ConfidenceTag } from './ConfidenceTag';

export function MeasurementReadout({
  label,
  measurement,
  extra,
}: {
  label: string;
  measurement: Measurement;
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = measurement.value !== null;

  return (
    <div className="border-b border-turf-700 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">{label}</div>
          {hasValue ? (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold text-chalk-100 font-tabular">
                {measurement.value}
              </span>
              <span className="font-mono text-sm text-slateg-400">{measurement.unit}</span>
            </div>
          ) : (
            <div className="mt-1 font-body text-lg text-slateg-400">Insufficient tracking confidence</div>
          )}
          {extra}
          {hasValue && measurement.rangeLow !== null && measurement.rangeHigh !== null && (
            <div className="mt-1 font-mono text-sm text-chalk-500">
              Likely range: {measurement.rangeLow}–{measurement.rangeHigh} {measurement.unit}
            </div>
          )}
        </div>
        <ConfidenceTag level={measurement.confidenceLevel} score={measurement.confidence} />
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-3 flex items-center gap-1 font-mono text-xs text-slateg-400 hover:text-chalk-300 transition-colors"
      >
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        Why this result?
      </button>
      {open && (
        <p className="mt-2 border-l-2 border-turf-600 pl-3 font-body text-sm leading-relaxed text-chalk-300">
          {measurement.reason}
        </p>
      )}
    </div>
  );
}
