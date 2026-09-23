import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Cell } from 'recharts';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';

const chartTooltipStyle = {
  background: '#1A251E',
  border: '1px solid #324A38',
  borderRadius: 2,
  fontFamily: 'IBM Plex Mono',
  fontSize: 12,
  color: '#F5F1E7',
};

export default function Analytics() {
  const deliveries = sampleSession.deliveries;

  const paceData = deliveries.map(d => ({ ball: d.index, pace: d.pace.value, confidence: d.pace.confidence ?? 0 }));
  const swingData = deliveries
    .filter(d => d.swing.value !== null)
    .map(d => ({ ball: d.index, swing: d.swing.value }));

  const avgPace = Math.round(deliveries.reduce((a, d) => a + (d.pace.value ?? 0), 0) / deliveries.length);
  const avgConf = Math.round(deliveries.reduce((a, d) => a + (d.pace.confidence ?? 0), 0) / deliveries.length);
  const avgSwing = Math.round(
    deliveries.filter(d => d.swing.value).reduce((a, d) => a + (d.swing.value ?? 0), 0) /
      Math.max(1, deliveries.filter(d => d.swing.value).length)
  );
  const bestTracking = Math.max(...deliveries.map(d => d.trackingQuality));

  return (
    <div className="max-w-4xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Session analytics</h1>
      <div className="mt-5"><SampleDataBanner /></div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-turf-700 border border-turf-700">
        {[
          ['Deliveries', deliveries.length],
          ['Average pace', `${avgPace} km/h`],
          ['Average confidence', `${avgConf}%`],
          ['Average swing', `${avgSwing} cm`],
          ['Best tracking quality', `${bestTracking}%`],
        ].map(([label, val]) => (
          <div key={label} className="bg-turf-900 p-4">
            <div className="font-mono text-xs text-slateg-400">{label}</div>
            <div className="mt-1 font-display text-2xl font-semibold text-chalk-100 font-tabular">{val}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-3">Pace by delivery</h2>
        <div className="h-56 rounded-sm border border-turf-700 bg-turf-900 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paceData}>
              <CartesianGrid stroke="#243428" vertical={false} />
              <XAxis dataKey="ball" tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: '#324A38' }} tickLine={false} />
              <YAxis tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} unit=" km/h" width={68} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#1A251E' }} />
              <Bar dataKey="pace" radius={[2, 2, 0, 0]}>
                {paceData.map((d, i) => (
                  <Cell key={i} fill={d.confidence >= 85 ? '#4C7A3F' : d.confidence >= 60 ? '#D9A441' : '#B33027'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-3">Confidence by delivery</h2>
        <div className="h-48 rounded-sm border border-turf-700 bg-turf-900 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paceData}>
              <CartesianGrid stroke="#243428" vertical={false} />
              <XAxis dataKey="ball" tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: '#324A38' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} unit="%" width={44} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="confidence" stroke="#D9A441" strokeWidth={2} dot={{ r: 3, fill: '#D9A441' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-3">Swing by delivery (statistically distinguishable only)</h2>
        <div className="h-48 rounded-sm border border-turf-700 bg-turf-900 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={swingData}>
              <CartesianGrid stroke="#243428" vertical={false} />
              <XAxis dataKey="ball" tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: '#324A38' }} tickLine={false} />
              <YAxis tick={{ fill: '#7C8680', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} unit=" cm" width={54} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#1A251E' }} />
              <Bar dataKey="swing" fill="#4C7A3F" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
