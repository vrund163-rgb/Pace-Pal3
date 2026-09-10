import { Info } from 'lucide-react';

export function SampleDataBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
      <p className="font-body text-sm text-chalk-300">
        <span className="font-medium text-amber-500">Sample data.</span> The tracking backend isn't
        connected yet, so everything below is placeholder data for reviewing the interface. No delivery
        here was measured from real video.
      </p>
    </div>
  );
}
