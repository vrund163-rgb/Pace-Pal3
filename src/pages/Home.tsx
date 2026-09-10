import { Link } from 'react-router-dom';
import { ArrowRight, Gauge, Wind, Target, Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-4xl px-6 lg:px-10 py-12 lg:py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-seam-400">Ball-tracking analysis</p>
      <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold leading-[1.05] text-chalk-100">
        We don't just give you a number.<br />We tell you how reliable it is.
      </h1>
      <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-chalk-300">
        Pace Pal tracks your bowling from a single camera and reconstructs pace, swing, line and length —
        every measurement shown with its likely range and a plain-language reason, not a fake decimal point.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/record"
          className="inline-flex items-center gap-2 rounded-sm bg-seam-500 px-5 py-3 font-body font-medium text-chalk-100 hover:bg-seam-400 transition-colors"
        >
          Start a session <ArrowRight size={16} />
        </Link>
        <Link
          to="/sessions/sample-session-1"
          className="inline-flex items-center gap-2 rounded-sm border border-turf-600 px-5 py-3 font-body text-chalk-300 hover:border-turf-500 hover:text-chalk-100 transition-colors"
        >
          View a sample session
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-px bg-turf-700 border border-turf-700">
        {[
          { icon: Gauge, title: 'Pace, with a range', body: 'Estimated speed and a likely range, calculated from how well the ball was actually tracked — never a false-precision single number.' },
          { icon: Wind, title: 'Swing only when it\u2019s real', body: 'Lateral movement is only reported when it clearly exceeds tracking uncertainty. Otherwise: "swing not reliably detected."' },
          { icon: Target, title: 'Line, length, pitch map', body: 'Every delivery plotted by line and length, classified from yorker to short, filterable by confidence.' },
          { icon: Box, title: '3D trajectory & umpire view', body: 'Rotate the reconstructed flight path, or switch to an umpire-style perspective for a closer look at the line.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-turf-900 p-6">
            <Icon size={20} className="text-seam-400" />
            <h3 className="mt-3 font-display text-xl font-semibold text-chalk-100">{title}</h3>
            <p className="mt-1.5 font-body text-sm leading-relaxed text-chalk-300">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-sm border border-turf-700 bg-turf-900 p-6">
        <h3 className="font-display text-xl font-semibold text-chalk-100">Where this build stands</h3>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-chalk-300">
          This is the frontend and data architecture, wired to a defined pipeline contract. The actual computer-vision
          tracking backend isn't connected yet — screens showing results are populated with clearly labelled sample
          data so the full experience can be reviewed before that backend exists. Nothing here is presented as a real
          measurement.
        </p>
      </div>
    </div>
  );
}
