import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, Pause } from 'lucide-react';
import { getFrameUrl } from '../lib/api';

export interface PathPoint { frame: number; x: number; y: number }

/**
 * Pick a point on a video frame.
 *
 * Scrubbing: if the person still has the video file they chose, we play THAT in the browser, so moving the slider,
 * stepping frames and playing in slow motion are instant (no waiting on the server). When they stop moving, we fetch
 * the exact frame from the server, and clicks are made on that exact frame, so the point lines up with what the
 * tracker sees. If the file can't be played in the browser (some phone formats), it falls back to server frames.
 */
export function FramePicker({
  sessionId, frameCount, fps, file, title, steps, minFrame, maxFrame, initialFrame, actionLabel, onConfirm,
  extraControls, pathPoints, pointHint,
}: {
  sessionId: string;
  frameCount: number;
  fps: number;
  file: File | null;
  title: string;
  steps: string[];
  minFrame?: number;
  maxFrame?: number;
  initialFrame?: number;
  actionLabel: string;
  onConfirm: (p: { frame: number; x: number; y: number }) => Promise<void> | void;
  extraControls?: React.ReactNode;
  pathPoints?: PathPoint[];
  pointHint?: string;
}) {
  const lo = Math.max(0, minFrame ?? 0);
  const hi = Math.max(lo + 1, maxFrame ?? ((frameCount || 600) - 1));
  const clamp = (n: number) => Math.min(hi, Math.max(lo, n));

  const [idx, setIdx] = useState(clamp(initialFrame ?? Math.floor((lo + hi) / 2)));
  const [exactIdx, setExactIdx] = useState<number | null>(null);   // frame whose exact server image we want
  const [exactReady, setExactReady] = useState<number | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [pt, setPt] = useState<{ frame: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.25);
  const [videoOk, setVideoOk] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const useVideo = !!videoUrl && videoOk && fps > 0;

  useEffect(() => {
    if (!file) { setVideoUrl(null); return; }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // keep the local video on the chosen frame (aim for the middle of the frame's time slot)
  useEffect(() => {
    const v = videoRef.current;
    if (useVideo && v && !playing && v.readyState >= 1) v.currentTime = (idx + 0.5) / fps;
  }, [idx, useVideo, playing, fps]);

  // once the person stops moving, ask the server for the exact frame
  useEffect(() => {
    if (playing) return;
    const t = window.setTimeout(() => setExactIdx(idx), useVideo ? 300 : 120);
    return () => window.clearTimeout(t);
  }, [idx, playing, useVideo]);

  // while playing, follow the video's own clock
  useEffect(() => {
    if (!playing || !useVideo) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) {
        const f = clamp(Math.floor(v.currentTime * fps));
        setIdx(prev => (prev !== f ? f : prev));
        if (f >= hi || v.ended) { v.pause(); setPlaying(false); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, useVideo, fps, hi]);

  function togglePlay() {
    const v = videoRef.current;
    if (!useVideo || !v) return;
    if (playing) { v.pause(); setPlaying(false); return; }
    v.playbackRate = rate;
    if (idx >= hi) setIdx(lo);
    v.currentTime = ((idx >= hi ? lo : idx) + 0.5) / fps;
    v.play().then(() => setPlaying(true)).catch(() => setVideoOk(false));
  }
  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = rate; }, [rate]);

  const step = (d: number) => { if (playing) togglePlay(); setIdx(i => clamp(i + d)); };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(e.shiftKey ? -10 : -1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(e.shiftKey ? 10 : 1); }
    else if (e.key === ' ' && useVideo) { e.preventDefault(); togglePlay(); }
  }

  const exactVisible = exactIdx === idx && exactReady === idx && !playing;

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img || !exactVisible) return;
    const r = img.getBoundingClientRect();
    setPt({
      frame: idx,
      x: (e.clientX - r.left) * (img.naturalWidth / r.width),
      y: (e.clientY - r.top) * (img.naturalHeight / r.height),
    });
  }

  async function confirm() {
    if (!pt) return;
    setSubmitting(true);
    setError('');
    try { await onConfirm(pt); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setSubmitting(false); }
  }

  const btn = 'rounded-sm border border-turf-700 p-1.5 text-slateg-400 hover:text-chalk-100 hover:border-turf-600 transition-colors';
  const marker = pt && pt.frame === idx && nat ? { l: (pt.x / nat.w) * 100, t: (pt.y / nat.h) * 100 } : null;
  const here = pathPoints?.find(p => p.frame === idx);

  return (
    <div className="rounded-sm border border-turf-700 bg-turf-900 p-5" tabIndex={0} onKeyDown={onKey}>
      <div className="font-mono text-xs uppercase tracking-wide text-slateg-400">{title}</div>
      <ol className="mt-2 list-decimal space-y-0.5 pl-5 font-body text-xs leading-relaxed text-slateg-400">
        {steps.map(s => <li key={s}>{s}</li>)}
      </ol>
      <p className="mt-2 font-mono text-[11px] text-slateg-400">
        {useVideo
          ? 'Scrubbing uses your own video file, so it is instant. Arrow keys step one frame (hold Shift for 10); Space plays.'
          : file
            ? "This video format can't be played in your browser, so frames come from the server (a little slower). Pause on a spot and wait a moment for the exact frame to load."
            : 'Frames come from the server (a little slower). Pause on a spot and wait a moment for the exact frame to load.'}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {useVideo && (
          <button className={btn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )}
        <button className={btn} onClick={() => step(-10)} aria-label="Back 10 frames"><ChevronsLeft size={14} /></button>
        <button className={btn} onClick={() => step(-1)} aria-label="Back 1 frame"><ChevronLeft size={14} /></button>
        <input
          type="range" min={lo} max={hi} value={idx}
          onChange={e => { if (playing) togglePlay(); setIdx(Number(e.target.value)); }}
          className="flex-1 accent-seam-500"
          aria-label="Choose a video frame"
        />
        <button className={btn} onClick={() => step(1)} aria-label="Forward 1 frame"><ChevronRight size={14} /></button>
        <button className={btn} onClick={() => step(10)} aria-label="Forward 10 frames"><ChevronsRight size={14} /></button>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-slateg-400">
        <span>Frame {idx}{minFrame !== undefined || maxFrame !== undefined ? ` (range ${lo}–${hi})` : ` of ${hi}`}{fps ? ` · ${(idx / fps).toFixed(2)} s` : ''}</span>
        <span className="flex items-center gap-3">
          {useVideo && (
            <span className="flex items-center gap-1.5">
              Speed
              <select value={rate} onChange={e => setRate(Number(e.target.value))} className="rounded-sm border border-turf-700 bg-turf-950 px-1 py-0.5" aria-label="Playback speed">
                {[0.05, 0.1, 0.25, 0.5, 1].map(r => <option key={r} value={r}>{r}×</option>)}
              </select>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            Zoom
            {[1, 2, 3].map(z => (
              <button key={z} onClick={() => setZoom(z)}
                className={`rounded-sm border px-1.5 py-0.5 ${zoom === z ? 'border-seam-500/50 bg-seam-500/15 text-chalk-100' : 'border-turf-700 hover:text-chalk-300'}`}>
                {z}×
              </button>
            ))}
          </span>
        </span>
      </div>

      <div className="mt-3 max-h-[70vh] overflow-auto rounded-sm border border-turf-700 bg-turf-950">
        <div className="relative" style={{ width: `${zoom * 100}%` }}>
          {useVideo && (
            <video
              ref={videoRef}
              src={videoUrl ?? undefined}
              muted playsInline preload="auto"
              onLoadedMetadata={() => { const v = videoRef.current; if (v) v.currentTime = (idx + 0.5) / fps; }}
              onError={() => setVideoOk(false)}
              className="block w-full"
            />
          )}
          {/* exact server frame: sits on top of the video once loaded and is what you click on */}
          {(exactIdx !== null) && (
            <img
              ref={imgRef}
              key={exactIdx}
              src={getFrameUrl(sessionId, exactIdx)}
              alt={`Video frame ${exactIdx}`}
              onClick={handleClick}
              onLoad={e => { setExactReady(exactIdx); setLoadError(false); setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }); }}
              onError={() => setLoadError(true)}
              className={`${useVideo ? 'absolute inset-0' : 'block'} w-full ${exactVisible ? 'cursor-crosshair opacity-100' : useVideo ? 'pointer-events-none opacity-0' : 'cursor-wait opacity-40'}`}
              draggable={false}
            />
          )}
          {exactVisible && nat && pathPoints && (
            <svg viewBox={`0 0 ${nat.w} ${nat.h}`} className="pointer-events-none absolute inset-0 h-full w-full">
              {pathPoints.map(p => (
                <circle key={p.frame} cx={p.x} cy={p.y} r={nat.w * 0.004} fill="#B33027" fillOpacity={0.45} />
              ))}
              {here && <circle cx={here.x} cy={here.y} r={nat.w * 0.012} fill="none" stroke="#D9A441" strokeWidth={nat.w * 0.003} />}
            </svg>
          )}
          {marker && exactVisible && (
            <div className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-500"
              style={{ left: `${marker.l}%`, top: `${marker.t}%` }} />
          )}
        </div>
      </div>
      <div className="mt-1 font-mono text-[11px] text-slateg-400">
        {!exactVisible && !playing ? 'Loading the exact frame… (then you can click)' : exactVisible ? (pointHint ?? 'Click to place your point.') : 'Playing…'}
        {pathPoints && here ? ' The gold ring is where the tracker has the ball on this frame.' : ''}
      </div>
      {loadError && <p className="mt-2 font-mono text-xs text-seam-400">Couldn&apos;t load this frame. It may be past the end of the video.</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {extraControls}
        <button onClick={confirm} disabled={!pt || submitting}
          className="rounded-sm bg-seam-500 px-4 py-2 font-body text-sm text-chalk-100 hover:bg-seam-400 disabled:opacity-40 transition-colors">
          {submitting ? 'Working…' : actionLabel}
        </button>
        {!pt && <span className="font-mono text-xs text-amber-500">Click on the frame first.</span>}
        {pt && pt.frame !== idx && <span className="font-mono text-xs text-slateg-400">Your point is on frame {pt.frame}; that is the frame that will be used.</span>}
      </div>
      {error && <p className="mt-3 font-body text-sm text-seam-400">{error}</p>}
    </div>
  );
}
