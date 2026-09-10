import { useState } from 'react';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';
import { UmpireViewPanel } from '../components/UmpireViewPanel';

export default function UmpireViewPage() {
  const [deliveryId, setDeliveryId] = useState(sampleSession.deliveries[0].id);
  const delivery = sampleSession.deliveries.find(d => d.id === deliveryId)!;

  return (
    <div className="max-w-2xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Umpire view</h1>
      <p className="mt-2 font-body text-chalk-300">A perspective-corrected reconstruction of the delivery, for visual review.</p>
      <div className="mt-5"><SampleDataBanner /></div>

      <div className="mt-6">
        <label className="font-mono text-xs uppercase tracking-wide text-slateg-400">Delivery</label>
        <select
          value={deliveryId}
          onChange={e => setDeliveryId(e.target.value)}
          className="mt-1.5 block w-full rounded-sm border border-turf-700 bg-turf-900 px-3 py-2 font-body text-sm text-chalk-100"
        >
          {sampleSession.deliveries.map(d => (
            <option key={d.id} value={d.id}>
              Delivery #{d.index} — {d.pace.value} km/h, {d.lengthClass?.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <UmpireViewPanel delivery={delivery} />
      </div>
    </div>
  );
}
