import { useState } from 'react';
import { trackFromPoint } from '../lib/api';
import { FramePicker } from './FramePicker';

type Direction = 'both' | 'forward' | 'backward';

export function SeedPicker({
  sessionId, frameCount, fps, file, intro, onStarted,
}: {
  sessionId: string; frameCount: number; fps: number; file: File | null; intro: string; onStarted: () => void;
}) {
  const [direction, setDirection] = useState<Direction>('both');
  return (
    <div>
      <p className="mb-2 font-body text-sm text-chalk-300">{intro}</p>
      <FramePicker
        sessionId={sessionId} frameCount={frameCount} fps={fps} file={file}
        title="Click the ball yourself"
        steps={[
          'Play slowly, or use the slider and arrows, to find a frame where you can clearly see the ball (just after release is ideal).',
          "Zoom in if it's tiny, wait for the exact frame to load, then click the centre of the ball.",
          'Press “Track from here”. It follows the ball both ways from that frame.',
        ]}
        pointHint="Click the centre of the ball."
        actionLabel="Track from here"
        extraControls={
          <select value={direction} onChange={e => setDirection(e.target.value as Direction)}
            className="rounded-sm border border-turf-700 bg-turf-950 px-2 py-1.5 font-mono text-xs text-chalk-100" aria-label="Tracking direction">
            <option value="both">Track both ways (recommended)</option>
            <option value="forward">Forward only</option>
            <option value="backward">Backward only</option>
          </select>
        }
        onConfirm={async p => { await trackFromPoint(sessionId, { frame: p.frame, x: p.x, y: p.y, direction }); onStarted(); }}
      />
    </div>
  );
}
