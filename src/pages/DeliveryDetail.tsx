import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';
import { MeasurementReadout } from '../components/MeasurementReadout';
import { TrajectoryViewer } from '../components/TrajectoryViewer';
import { UmpireViewPanel } from '../components/UmpireViewPanel';

const tabs = ['Overview', 'Umpire view', '3D trajectory', 'Tracking data'] as const;

export default function DeliveryDetail() {
  const { sessionId, deliveryId } = useParams();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');

  const session = sessionId === sampleSession.id ? sampleSession : null;
  const delivery = session?.deliveries.find(d => d.id === deliveryId);

  if (!session || !delivery) {
    return <div className="px-10 py-10 font-body text-chalk-300">Delivery not found.</div>;
  }

  return (
    <div className="max-w-3xl px-6 lg:px-10 py-10">
      <Link to={`/sessions/${session.id}`} className="inline-flex items-center gap-1.5 font-mono text-xs text-slateg-400 hover:text-chalk-300">
        <ArrowLeft size={13} /> Back to session
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold text-chalk-100">Delivery #{delivery.index}</h1>
        <div className="text-right">
          <div className="font-mono text-xs text-slateg-400">Delivery quality</div>
          <div className="font-display text-lg text-amber-500">
            {'★'.repeat(Math.round(delivery.qualityBreakdown.overall / 20))}
            <span className="text-turf-700">{'★'.repeat(5 - Math.round(delivery.qualityBreakdown.overall / 20))}</span>
          </div>
        </div>
      </div>

      <div className="mt-4"><SampleDataBanner /></div>

      {delivery.flagged && (
        <div className="mt-4 flex items-start gap-2.5 rounded-sm border border-seam-500/30 bg-seam-500/5 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-seam-400" />
          <p className="font-body text-sm text-chalk-300">{delivery.flagReason}</p>
        </div>
      )}

      <div className="mt-6 flex gap-1 border-b border-turf-700 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-3 py-2.5 font-body text-sm border-b-2 transition-colors ${
              tab === t ? 'border-seam-500 text-chalk-100' : 'border-transparent text-slateg-400 hover:text-chalk-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="mt-2">
          <div className="flex aspect-video items-center justify-center rounded-sm border border-turf-700 bg-turf-900 mt-4">
            <button className="flex items-center gap-2 rounded-full bg-turf-800 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-turf-700 transition-colors">
              <Play size={15} /> Watch delivery
            </button>
          </div>

          <MeasurementReadout label="Pace" measurement={delivery.pace} />
          <MeasurementReadout
            label="Swing"
            measurement={delivery.swing}
            extra={
              delivery.swing.direction !== 'not_detected' && (
                <div className="mt-1 font-mono text-xs uppercase tracking-wide text-chalk-500">
                  {delivery.swing.direction.replace('_', ' ')}
                </div>
              )
            }
          />
          <MeasurementReadout label="Line" measurement={delivery.line} />
          <MeasurementReadout label="Length" measurement={delivery.length} />

          <div className="border-b border-turf-700 py-4">
            <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Delivery type</div>
            <div className="mt-1 font-display text-2xl font-semibold text-chalk-100">
              {delivery.lengthClass ? delivery.lengthClass.replace(/_/g, ' ') : 'Not classified'}
            </div>
          </div>

          <div className="py-4">
            <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Spin</div>
            <p className="mt-1 font-body text-sm text-chalk-300">{delivery.spinNote}</p>
          </div>
        </div>
      )}

      {tab === 'Umpire view' && (
        <div className="mt-4">
          <UmpireViewPanel delivery={delivery} />
        </div>
      )}

      {tab === '3D trajectory' && (
        <div className="mt-4">
          <TrajectoryViewer trajectory={delivery.trajectory} />
        </div>
      )}

      {tab === 'Tracking data' && (
        <div className="mt-4 space-y-4">
          <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              <div><span className="text-slateg-400">Frames tracked</span><br /><span className="text-chalk-100">{delivery.framesTracked} / {delivery.framesTotal}</span></div>
              <div><span className="text-slateg-400">Tracking quality</span><br /><span className="text-chalk-100">{delivery.trackingQuality}%</span></div>
              <div><span className="text-slateg-400">Calibration</span><br /><span className="text-chalk-100">{delivery.qualityBreakdown.calibration}%</span></div>
              <div><span className="text-slateg-400">Trajectory fit</span><br /><span className="text-chalk-100">{delivery.qualityBreakdown.trajectory}%</span></div>
            </div>
          </div>
          {delivery.occludedRanges.length > 0 && (
            <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
              <div className="font-mono text-xs uppercase tracking-wide text-slateg-400 mb-2">Occlusion</div>
              <ul className="space-y-1 font-mono text-sm text-chalk-300">
                {delivery.occludedRanges.map((r, i) => (
                  <li key={i}>Ball occluded for frames {r.start}–{r.end} ({r.end - r.start + 1} frames)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
