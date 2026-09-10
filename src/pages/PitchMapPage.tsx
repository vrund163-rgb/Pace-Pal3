import { useNavigate } from 'react-router-dom';
import { sampleSession } from '../data/mockData';
import { SampleDataBanner } from '../components/SampleDataBanner';
import { PitchMapChart } from '../components/PitchMapChart';

export default function PitchMapPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Pitch map</h1>
      <p className="mt-2 font-body text-chalk-300">Every delivery in the sample session, plotted by line and length.</p>
      <div className="mt-5"><SampleDataBanner /></div>
      <div className="mt-8">
        <PitchMapChart
          deliveries={sampleSession.deliveries}
          onSelect={d => navigate(`/sessions/${sampleSession.id}/deliveries/${d.id}`)}
        />
      </div>
    </div>
  );
}
