import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { PROCESSING_STAGES } from '../types';

export default function Processing() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= PROCESSING_STAGES.length) {
      const t = setTimeout(() => navigate('/sessions/sample-session-1'), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage(s => s + 1), 550);
    return () => clearTimeout(t);
  }, [stage, navigate]);

  return (
    <div className="max-w-lg px-6 lg:px-10 py-16">
      <h1 className="font-display text-3xl font-semibold text-chalk-100">Analysing your session…</h1>
      <p className="mt-2 font-body text-sm text-chalk-300">
        This view demonstrates the pipeline stages. Once a real backend is connected, each step reflects
        actual processing rather than a timed simulation.
      </p>
      <ul className="mt-8 space-y-3">
        {PROCESSING_STAGES.map((label, i) => (
          <li key={label} className="flex items-center gap-3 font-body text-sm">
            {i < stage ? (
              <CheckCircle2 size={18} className="text-turf-500 shrink-0" />
            ) : i === stage ? (
              <Loader2 size={18} className="text-amber-500 shrink-0 animate-spin" />
            ) : (
              <Circle size={18} className="text-turf-700 shrink-0" />
            )}
            <span className={i <= stage ? 'text-chalk-100' : 'text-slateg-400'}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
