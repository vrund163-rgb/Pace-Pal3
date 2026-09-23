import { useState } from 'react';

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-turf-700 last:border-b-0">
      <div>
        <div className="font-body text-sm text-chalk-100">{label}</div>
        <div className="mt-0.5 font-body text-xs text-chalk-500">{description}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-turf-500' : 'bg-turf-700'}`}
        aria-pressed={on}
        aria-label={label}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-chalk-100 transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-2xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Settings</h1>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">Privacy</h2>
        <p className="mt-2 font-body text-sm text-chalk-300">
          Videos are sensitive by default. Nothing is stored or shared unless you choose to.
        </p>
        <div className="mt-4 rounded-sm border border-turf-700 bg-turf-900 px-5">
          <Toggle label="Store session videos" description="Keep raw recordings after processing, for re-review or clip export." />
          <Toggle label="Allow anonymised metrics to improve tracking" description="Share tracking failure patterns (not video) to help improve the model. Never trains on your video without this." />
          <Toggle label="Share sessions with coach" description="Let a linked coach account view your sessions and analytics." />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">Data</h2>
        <div className="mt-4 rounded-sm border border-turf-700 bg-turf-900 p-5">
          <button className="font-body text-sm text-seam-400 hover:text-seam-300">Delete all stored videos</button>
          <p className="mt-1.5 font-body text-xs text-chalk-500">Removes stored video files. Delivery measurements and clips are kept unless you delete the session too.</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400">Length classification thresholds</h2>
        <p className="mt-2 font-body text-sm text-chalk-300">Customise where yorker / full / good length / short boundaries sit, in metres from the batter-end stumps.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-sm border border-turf-700 bg-turf-900 p-5">
          {[
            ['Yorker, up to', '1.5 m'],
            ['Full, up to', '4.0 m'],
            ['Good length, up to', '7.5 m'],
            ['Short of a length, up to', '9.5 m'],
          ].map(([label, val]) => (
            <div key={label}>
              <label className="font-mono text-xs text-slateg-400">{label}</label>
              <input
                defaultValue={val}
                className="mt-1 block w-full rounded-sm border border-turf-700 bg-turf-950 px-2.5 py-1.5 font-mono text-sm text-chalk-100"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
