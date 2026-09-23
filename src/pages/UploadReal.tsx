import { useState, useRef } from 'react';
import { AlertTriangle, UploadCloud } from 'lucide-react';
import { uploadVideo, getSessionStatus, isBackendConfigured } from '../lib/api';

export default function UploadReal() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus('uploading');
    setError('');
    setSession(null);
    try {
      const { sessionId } = await uploadVideo(file);
      setStatus('processing');
      poll(sessionId);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function poll(sessionId: string) {
    const interval = setInterval(async () => {
      try {
        const data = await getSessionStatus(sessionId);
        setSession(data);
        if (data.status === 'complete' || data.status === 'failed') {
          clearInterval(interval);
          setStatus(data.status === 'complete' ? 'done' : 'error');
          if (data.error) setError(data.error);
        }
      } catch (e) {
        clearInterval(interval);
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    }, 2000);
  }

  if (!isBackendConfigured()) {
    return (
      <div className="max-w-xl px-6 lg:px-10 py-10">
        <h1 className="font-display text-4xl font-semibold text-chalk-100">Analyze real video</h1>
        <div className="mt-5 flex items-start gap-2.5 rounded-sm border border-seam-500/30 bg-seam-500/5 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-seam-400" />
          <p className="font-body text-sm text-chalk-300">
            No backend is configured. Set <code className="font-mono text-chalk-100">VITE_API_BASE_URL</code> to
            your deployed backend URL (see <code className="font-mono text-chalk-100">.env.example</code>) and rebuild.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Analyze real video</h1>
      <p className="mt-2 font-body text-chalk-300">
        Upload a real clip. This calls the actual backend — metadata, quality, and ball tracking are
        real measurements, not sample data. Calibration and full delivery analysis aren't implemented yet.
      </p>

      <div className="mt-6 rounded-sm border border-dashed border-turf-600 bg-turf-900 p-8 text-center">
        <input
          ref={fileInput}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <UploadCloud size={28} className="mx-auto text-slateg-400" />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={status === 'uploading' || status === 'processing'}
          className="mt-3 rounded-sm bg-seam-500 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-seam-400 disabled:opacity-40 transition-colors"
        >
          Choose a video
        </button>
      </div>

      {status === 'uploading' && <p className="mt-4 font-mono text-sm text-slateg-400">Uploading…</p>}
      {status === 'processing' && (
        <p className="mt-4 font-mono text-sm text-amber-500">
          Processing: {session?.processingStageLabel ?? 'starting'}…
        </p>
      )}
      {status === 'error' && (
        <div className="mt-4 flex items-start gap-2.5 rounded-sm border border-seam-500/30 bg-seam-500/5 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-seam-400" />
          <p className="font-body text-sm text-chalk-300">{error}</p>
        </div>
      )}

      {session && status === 'done' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
            <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Video quality</div>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm text-chalk-100">
              <div>Score: {session.videoQuality.score}/100</div>
              <div>FPS: {session.videoQuality.fps}</div>
              <div>Resolution: {session.videoQuality.resolution}</div>
              <div>Lighting: {session.videoQuality.lighting}</div>
              <div>Motion blur: {session.videoQuality.motionBlur}</div>
              <div>Stability: {session.videoQuality.stability}</div>
            </div>
            <p className="mt-2 font-body text-sm text-chalk-300">{session.videoQuality.note}</p>
          </div>

          {session.trackingPreview && (
            <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
              <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Ball tracking (pixel space)</div>
              <div className="mt-2 font-mono text-sm text-chalk-100">
                Detected in {session.trackingPreview.framesDetected} / {session.trackingPreview.framesTotal} frames
                ({session.trackingPreview.detectionRatePct}%)
              </div>
              <p className="mt-2 font-body text-sm text-chalk-300">{session.trackingPreview.note}</p>
            </div>
          )}

          <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
            <p className="font-body text-sm text-chalk-300">{session.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
