import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Flag } from 'lucide-react';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';
import { ConfidenceTag } from '../components/ConfidenceTag';
import { PitchMapChart } from '../components/PitchMapChart';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = id === sampleSession.id ? sampleSession : null;

  if (!session) {
    return <div className="px-10 py-10 font-body text-chalk-300">Session not found.</div>;
  }

  const included = session.deliveries.filter(d => d.included);
  const paces = included.map(d => d.pace.value ?? 0);
  const avgPace = Math.round(paces.reduce((a, b) => a + b, 0) / paces.length);
  const fastest = Math.max(...paces);
  const slowest = Math.min(...paces);
  const highConf = included.filter(d => (d.pace.confidence ?? 0) >= 85);
  const reliableFastest = highConf.length ? Math.max(...highConf.map(d => d.pace.value ?? 0)) : null;
  const avgConf = Math.round(included.reduce((a, d) => a + (d.pace.confidence ?? 0), 0) / included.length);

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">{session.name}</h1>
      <div className="mt-5"><SampleDataBanner /></div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-turf-700 border border-turf-700">
        {[
          ['Deliveries', included.length],
          ['Average pace', `${avgPace} km/h`],
          ['Fastest (raw)', `${fastest} km/h`],
          ['Reliable fastest', reliableFastest ? `${reliableFastest} km/h` : '—'],
        ].map(([label, val]) => (
          <div key={label} className="bg-turf-900 p-4">
            <div className="font-mono text-xs text-slateg-400">{label}</div>
            <div className="mt-1 font-display text-2xl font-semibold text-chalk-100 font-tabular">{val}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-slateg-400">
        Typical pace range {slowest}–{fastest} km/h · average model confidence {avgConf}%
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-3">Pitch map</h2>
          <PitchMapChart
            deliveries={included}
            onSelect={d => navigate(`/sessions/${session.id}/deliveries/${d.id}`)}
          />
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-3">Deliveries</h2>
          <div className="divide-y divide-turf-700 border border-turf-700 rounded-sm">
            {session.deliveries.map(d => (
              <Link
                key={d.id}
                to={`/sessions/${session.id}/deliveries/${d.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-turf-900 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-slateg-400 w-6">#{d.index}</span>
                  <div>
                    <div className="font-display text-lg font-semibold text-chalk-100 font-tabular">
                      {d.pace.value ?? '—'} <span className="font-mono text-xs text-slateg-400 font-normal">km/h</span>
                    </div>
                    <div className="font-mono text-xs text-slateg-400">
                      {d.lengthClass?.replace(/_/g, ' ') ?? 'unclassified'} · {d.swing.direction.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {d.flagged && <Flag size={14} className="text-amber-500" />}
                  <ConfidenceTag level={d.pace.confidenceLevel} score={d.pace.confidence} />
                  <ChevronRight size={16} className="text-slateg-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
