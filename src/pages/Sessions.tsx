import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';

export default function Sessions() {
  const sessions = [sampleSession];

  return (
    <div className="max-w-3xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Sessions</h1>
      <div className="mt-5"><SampleDataBanner /></div>

      <div className="mt-6 divide-y divide-turf-700 border border-turf-700 rounded-sm">
        {sessions.map(s => (
          <Link
            key={s.id}
            to={`/sessions/${s.id}`}
            className="flex items-center justify-between gap-4 p-5 hover:bg-turf-900 transition-colors"
          >
            <div>
              <div className="font-display text-xl font-semibold text-chalk-100">{s.name}</div>
              <div className="mt-1 font-mono text-xs text-slateg-400">
                {new Date(s.createdAt).toLocaleDateString()} · {s.deliveries.length} deliveries · calibration {s.calibration.status}
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-slateg-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
