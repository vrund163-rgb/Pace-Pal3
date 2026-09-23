import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sampleSession } from '../data/mockData';

const setupChecklist = [
  'Camera on a tripod, roughly 4m behind the bowler-end stumps',
  'Camera high enough to see the entire pitch',
  'Both ends of the pitch visible in frame',
  'Batter visible where possible',
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < value ? 'text-amber-500' : 'text-turf-700'}>★</span>
      ))}
    </div>
  );
}

export default function Record() {
  const navigate = useNavigate();
  const [calibrating, setCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const calib = sampleSession.calibration;

  function runCalibration() {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrated(true);
    }, 1400);
  }

  return (
    <div className="max-w-3xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Record a session</h1>
      <p className="mt-2 font-body text-chalk-300">Set up your camera, calibrate, then start — Pace Pal detects deliveries automatically.</p>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">1. Camera setup</h2>
        <ul className="mt-3 space-y-2">
          {setupChecklist.map(item => (
            <li key={item} className="flex items-start gap-2.5 font-body text-sm text-chalk-300">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-turf-500" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-sm border border-turf-700 bg-turf-900 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">Camera preview</h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slateg-400">Quality</span>
            <StarRating value={calib.cameraQuality} />
          </div>
        </div>
        <div className="mt-3 flex aspect-video items-center justify-center rounded-sm border border-dashed border-turf-600 bg-turf-950">
          <div className="text-center">
            <Video size={28} className="mx-auto text-slateg-400" />
            <p className="mt-2 font-mono text-xs text-slateg-400">Live camera preview appears here once connected to a capture device</p>
          </div>
        </div>
        <p className="mt-3 font-body text-sm text-chalk-300">{calib.cameraQualityNote}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">2. Calibration</h2>
        <div className="mt-3 rounded-sm border border-turf-700 bg-turf-900 p-5">
          {!calibrated && !calibrating && (
            <div>
              <p className="font-body text-sm text-chalk-300">
                Calibration finds the stumps, pitch boundaries and ground plane to establish real-world scale.
                It only takes a few seconds.
              </p>
              <button
                onClick={runCalibration}
                className="mt-4 rounded-sm bg-turf-600 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-turf-500 transition-colors"
              >
                Run auto-calibration
              </button>
            </div>
          )}
          {calibrating && (
            <div className="flex items-center gap-2 font-body text-sm text-chalk-300">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-turf-500 border-t-transparent" />
              Detecting stumps and pitch geometry…
            </div>
          )}
          {calibrated && (
            <div>
              <div className="flex items-center gap-2 font-body text-sm">
                <CheckCircle2 size={16} className="text-turf-500" />
                <span className="text-chalk-100 font-medium">Calibration: good</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs text-slateg-400">
                <div><dt className="inline">Stumps detected · </dt><dd className="inline text-chalk-300">Yes</dd></div>
                <div><dt className="inline">Pitch detected · </dt><dd className="inline text-chalk-300">Yes</dd></div>
                <div><dt className="inline">Ground plane · </dt><dd className="inline text-chalk-300">Yes</dd></div>
                <div><dt className="inline">Pitch length · </dt><dd className="inline text-chalk-300">{calib.pitchLengthMetres}m</dd></div>
              </dl>
              <button
                onClick={() => setCalibrated(false)}
                className="mt-3 font-mono text-xs text-slateg-400 underline hover:text-chalk-300"
              >
                Recalibrate manually
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 flex items-center justify-between rounded-sm border border-turf-700 bg-turf-900 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-chalk-100">Ready to bowl</h2>
          <p className="font-body text-sm text-chalk-300">Deliveries are detected automatically — no manual marking needed.</p>
        </div>
        <button
          disabled={!calibrated}
          onClick={() => navigate('/record/processing')}
          className="rounded-sm bg-seam-500 px-5 py-2.5 font-body font-medium text-chalk-100 hover:bg-seam-400 disabled:opacity-40 disabled:hover:bg-seam-500 transition-colors"
        >
          Start session
        </button>
      </section>

      {!calibrated && (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-amber-500">
          <AlertTriangle size={13} /> Calibrate before starting — analysis can't begin on unusable calibration.
        </p>
      )}
    </div>
  );
}
