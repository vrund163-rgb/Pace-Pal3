import { useState, useRef } from 'react';
import { AlertTriangle, UploadCloud } from 'lucide-react';
import { uploadVideo, getSessionStatus, isBackendConfigured, setBounce } from '../lib/api';
import { CalibrationPanel } from '../components/CalibrationPanel';
import { TrackOverlay } from '../components/TrackOverlay';
import { SeedPicker } from '../components/SeedPicker';
import { FramePicker } from '../components/FramePicker';
import { TrimPanel } from '../components/TrimPanel';

export default function UploadReal() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const [recalibrating, setRecalibrating] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [trimDraft, setTrimDraft] = useState<[number, number] | null>(null);
  const [showTrim, setShowTrim] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus('uploading');
    setError('');
    setSession(null);
    setLocalFile(file);
    setTrimDraft(null);
    setShowTrim(false);
    setShowBounce(false);
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

  const tp = session?.trackingPreview;
  const kept: any[] = tp?.trajectory ?? [];
  const fullPts: any[] = tp?.fullTrajectory?.length ? tp.fullTrajectory : kept;
  const fullFirst = fullPts.length ? Math.min(...fullPts.map((q: any) => q.frame)) : 0;
  const fullLast = fullPts.length ? Math.max(...fullPts.map((q: any) => q.frame)) : 0;
  const keptRange: [number, number] = kept.length ? [Math.min(...kept.map((q: any) => q.frame)), Math.max(...kept.map((q: any) => q.frame))] : [0, 0];
  const trimRange: [number, number] = trimDraft ?? keptRange;
  const overlayFrame = kept.length ? [...kept].sort((a: any, b: any) => a.frame - b.frame)[Math.floor(kept.length / 2)].frame : 0;

  return (
    <div className="max-w-2xl px-6 lg:px-10 py-10">
      <h1 className="font-display text-4xl font-semibold text-chalk-100">Analyze real video</h1>
      <p className="mt-2 font-body text-chalk-300">
        Upload a real clip. This calls the actual backend — metadata, quality, and ball tracking are
        real measurements, not sample data. After tracking, you can calibrate to get line and length, plus a rough pace estimate (with a wide range).
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
          Processing: {session?.processingStageLabel ?? 'starting'}
          {typeof session?.processingProgress === 'number' ? ` (${session.processingProgress}%)` : ''}…
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
                Ball found in {session.trackingPreview.framesDetected} of {session.trackingPreview.framesTotal} checked frames
                ({session.trackingPreview.detectionRatePct}%)
              </div>
              <p className="mt-2 font-body text-sm text-chalk-300">{session.trackingPreview.note}</p>
            </div>
          )}

          {session.trackingPreview && (session.trackingPreview.framesDetected === 0 || showSeed) && (
            <SeedPicker
              file={localFile}
              sessionId={session.id}
              frameCount={session.videoQuality?.frameCount ?? 0}
              fps={session.videoQuality?.fps ?? 0}
              intro={
                session.trackingPreview.framesDetected === 0
                  ? "The automatic detector couldn't find the ball in this clip. That's common for a small, fast cricket ball. You can show it where the ball is and it will follow it from there."
                  : 'Re-pick the ball on a frame where it is clearly visible. This replaces the current tracked path.'
              }
              onStarted={() => {
                setShowSeed(false);
                setRecalibrating(false);
                setStatus('processing');
                setSession((prev: any) => ({ ...prev, status: 'processing', processingStageLabel: 'Tracking from your click', processingProgress: 0 }));
                poll(session.id);
              }}
            />
          )}

          {session.trackingPreview && session.trackingPreview.framesDetected > 0 && !showSeed && (
            <button
              onClick={() => setShowSeed(true)}
              className="font-mono text-xs text-slateg-400 underline hover:text-chalk-300"
            >
              Path wrong or ball missed? Click the ball yourself
            </button>
          )}

          {session.trackingPreview?.framesDetected > 0 && (
            <TrackOverlay
              sessionId={session.id}
              trajectory={session.trackingPreview.trajectory}
              fullTrajectory={fullPts}
              trimRange={showTrim ? trimRange : null}
              frameIndex={overlayFrame}
              homography={session.calibration?.homography ?? null}
              calibratedResult={session.calibratedResult ?? null}
            />
          )}

          {session.trackingPreview?.framesDetected > 0 && !showTrim && (
            <button
              onClick={() => { setTrimDraft(keptRange); setShowTrim(true); }}
              className="font-mono text-xs text-slateg-400 underline hover:text-chalk-300"
            >
              Stray points on the path? Trim it
            </button>
          )}
          {showTrim && fullPts.length > 6 && (
            <TrimPanel
              sessionId={session.id}
              fullFirst={fullFirst}
              fullLast={fullLast}
              range={trimRange}
              onRange={setTrimDraft}
              onApplied={updated => { setSession(updated); setTrimDraft(null); }}
            />
          )}

          {session.trackingPreview?.framesDetected > 0 && (!session.calibratedResult || recalibrating) && (
            <CalibrationPanel
              sessionId={session.id}
              onDone={updated => { setSession(updated); setRecalibrating(false); }}
            />
          )}

          {session.calibratedResult && (
            <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
              <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Calibrated result</div>
              {session.calibratedResult.lineM != null ? (
                <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm text-chalk-100">
                  <div>Line: {session.calibratedResult.lineM} m from centreline</div>
                  <div>Length: {session.calibratedResult.lengthM} m from batter stumps</div>
                </div>
              ) : (
                <div className="mt-2 font-mono text-sm text-amber-500">Bounce not reliably found — no line or length shown.</div>
              )}
              <div className="mt-1 font-mono text-xs text-slateg-400">
                Calibrated from: {session.calibratedResult.calibrationMode === 'stumps' ? 'stumps (less accurate)' : 'crease corners'}
              </div>
              {session.calibratedResult.bounceConfidence === 'weak' && (
                <div className="mt-2 font-mono text-xs text-amber-500">Low confidence — treat these numbers with caution.</div>
              )}
              <p className="mt-2 font-body text-sm text-chalk-300">{session.calibratedResult.note}</p>
              {!recalibrating && (
                <button
                  onClick={() => setRecalibrating(true)}
                  className="mt-3 font-mono text-xs text-slateg-400 underline hover:text-chalk-300"
                >
                  Recalibrate (re-click the 4 points)
                </button>
              )}
            </div>
          )}

          {session.calibration?.homography && (
            <div className="rounded-sm border border-turf-700 bg-turf-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">Pace</div>
                {session.paceResult?.ok && (
                  <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-500">Rough estimate</span>
                )}
              </div>
              {session.paceResult?.ok ? (
                <>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold text-chalk-100">≈ {session.paceResult.kmh}</span>
                    <span className="font-mono text-sm text-slateg-400">km/h</span>
                  </div>
                  <div className="mt-1 font-mono text-sm text-chalk-500">
                    Likely range: {session.paceResult.lowKmh}–{session.paceResult.highKmh} km/h
                  </div>
                </>
              ) : (
                <div className="mt-2 font-mono text-sm text-amber-500">Pace not available for this clip.</div>
              )}
              <p className="mt-2 font-body text-sm text-chalk-300">{session.paceResult?.note}</p>
            </div>
          )}

          {session.calibration?.homography && session.trackingPreview?.framesDetected > 0 && (
            <div className="space-y-2">
              {!showBounce ? (
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setShowBounce(true)}
                    className="rounded-sm border border-turf-600 px-3 py-1.5 font-body text-sm text-chalk-300 hover:border-turf-500 hover:text-chalk-100 transition-colors"
                  >
                    {session.calibratedResult?.bounceConfidence === 'manual' ? 'Move the bounce point' : 'Click the bounce yourself'}
                  </button>
                  {session.calibratedResult?.bounceConfidence === 'manual' && (
                    <button
                      onClick={async () => setSession(await setBounce(session.id, { clear: true }))}
                      className="font-mono text-xs text-slateg-400 underline hover:text-chalk-300"
                    >
                      Go back to the automatic bounce
                    </button>
                  )}
                </div>
              ) : (
                <FramePicker
                  key="bounce"
                  sessionId={session.id}
                  frameCount={session.videoQuality?.frameCount ?? 0}
                  fps={session.videoQuality?.fps ?? 0}
                  file={localFile}
                  title="Click where the ball bounces"
                  steps={[
                    'Play slowly or step through the frames until you reach the frame where the ball touches the ground.',
                    'Zoom in, wait for the exact frame to load, then click the ball at the spot where it hits the ground.',
                    'Press “Use this bounce”. Line, length and pace are recalculated from your point.',
                  ]}
                  minFrame={keptRange[0]}
                  maxFrame={keptRange[1]}
                  initialFrame={session.calibratedResult?.bounceFrame != null ? Math.round(session.calibratedResult.bounceFrame) : undefined}
                  pathPoints={kept.map((q: any) => ({ frame: q.frame, x: q.x, y: q.y }))}
                  pointHint="Click the ball where it touches the ground."
                  actionLabel="Use this bounce"
                  onConfirm={async pnt => { setSession(await setBounce(session.id, pnt)); setShowBounce(false); }}
                />
              )}
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
