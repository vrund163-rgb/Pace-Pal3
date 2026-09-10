import type { Delivery, Session, TrajectoryPoint } from '../types';
import { confidenceLevelFromScore } from '../types';

// -----------------------------------------------------------------------
// SAMPLE DATA NOTICE
// Everything in this file is illustrative placeholder data used so the UI
// can be reviewed end to end before a real tracking backend is connected.
// Session.isSampleData = true on all of it, and the UI must surface that
// banner wherever this data is shown. No screen should ever present this
// as a real measurement.
// -----------------------------------------------------------------------

function buildTrajectory(seed: number, occluded: number[] = []): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const frames = 46;
  for (let f = 0; f < frames; f++) {
    const t = f / 30;
    const y = (f / frames) * 20.12;
    const bounceFrame = Math.round(frames * 0.62);
    const lateral = Math.sin(seed + f * 0.09) * 0.05 + (f > bounceFrame ? (seed % 3 - 1) * 0.15 * ((f - bounceFrame) / 15) : 0);
    const height = f < bounceFrame
      ? 1.9 - (f / bounceFrame) * 1.85
      : Math.max(0, 0.12 + ((f - bounceFrame) / (frames - bounceFrame)) * 0.9 * Math.sin(((f - bounceFrame) / (frames - bounceFrame)) * Math.PI));
    points.push({
      frame: f,
      t,
      x: Number(lateral.toFixed(3)),
      y: Number(y.toFixed(2)),
      z: Number(height.toFixed(2)),
      occluded: occluded.includes(f),
    });
  }
  return points;
}

function makeDelivery(partial: {
  id: string;
  index: number;
  paceVal: number; paceLow: number; paceHigh: number; paceConf: number | null; paceReason: string;
  swingVal: number; swingConf: number | null; swingDir: Delivery['swing']['direction']; swingReason: string;
  lineVal: number; lineConf: number;
  lengthVal: number; lengthConf: number; lengthClass: Delivery['lengthClass'];
  tracking: number; framesTracked: number; framesTotal: number;
  occludedRanges?: { start: number; end: number }[];
  flagged?: boolean; flagReason?: string | null;
  seed: number;
}): Delivery {
  const occludedFrames = (partial.occludedRanges ?? []).flatMap(r =>
    Array.from({ length: r.end - r.start + 1 }, (_, i) => r.start + i)
  );
  return {
    id: partial.id,
    sessionId: 'sample-session-1',
    index: partial.index,
    timestamp: new Date(Date.now() - (30 - partial.index) * 45000).toISOString(),
    releaseFrame: 4,
    bounceFrame: 29,
    batterFrame: 46,
    trackingQuality: partial.tracking,
    pace: {
      value: partial.paceVal,
      unit: 'km/h',
      rangeLow: partial.paceLow,
      rangeHigh: partial.paceHigh,
      confidence: partial.paceConf,
      confidenceLevel: confidenceLevelFromScore(partial.paceConf),
      reason: partial.paceReason,
    },
    swing: {
      value: partial.swingVal,
      unit: 'cm',
      rangeLow: partial.swingVal !== 0 ? Number((partial.swingVal - 4).toFixed(0)) : null,
      rangeHigh: partial.swingVal !== 0 ? Number((partial.swingVal + 4).toFixed(0)) : null,
      confidence: partial.swingConf,
      confidenceLevel: confidenceLevelFromScore(partial.swingConf),
      reason: partial.swingReason,
      direction: partial.swingDir,
    },
    line: {
      value: partial.lineVal,
      unit: 'm outside off',
      rangeLow: Number((partial.lineVal - 0.04).toFixed(2)),
      rangeHigh: Number((partial.lineVal + 0.04).toFixed(2)),
      confidence: partial.lineConf,
      confidenceLevel: confidenceLevelFromScore(partial.lineConf),
      reason: 'Stump geometry clearly resolved from calibration reference.',
    },
    length: {
      value: partial.lengthVal,
      unit: 'm from batter stumps',
      rangeLow: Number((partial.lengthVal - 0.15).toFixed(2)),
      rangeHigh: Number((partial.lengthVal + 0.15).toFixed(2)),
      confidence: partial.lengthConf,
      confidenceLevel: confidenceLevelFromScore(partial.lengthConf),
      reason: 'Bounce frame identified with low residual error.',
    },
    lengthClass: partial.lengthClass,
    spinDetected: false,
    spinNote: 'Spin could not be reliably determined from this recording.',
    framesTracked: partial.framesTracked,
    framesTotal: partial.framesTotal,
    occludedRanges: partial.occludedRanges ?? [],
    flagged: partial.flagged ?? false,
    flagReason: partial.flagReason ?? null,
    included: true,
    videoClipUrl: null,
    trajectory: buildTrajectory(partial.seed, occludedFrames),
    qualityBreakdown: {
      tracking: partial.tracking,
      calibration: 97,
      trajectory: Math.max(40, partial.tracking - 4),
      pace: partial.paceConf ?? 30,
      overall: Math.round((partial.tracking + 97 + (partial.paceConf ?? 30)) / 3),
    },
  };
}

export const sampleDeliveries: Delivery[] = [
  makeDelivery({
    id: 'd1', index: 1,
    paceVal: 91, paceLow: 89, paceHigh: 94, paceConf: 91,
    paceReason: 'Ball detected across 42/46 relevant frames with low trajectory fit error.',
    swingVal: 12, swingConf: 84, swingDir: 'outswing',
    swingReason: 'Lateral deviation of 12cm exceeds estimated tracking uncertainty of ±4cm.',
    lineVal: 0.19, lineConf: 96,
    lengthVal: 6.7, lengthConf: 97, lengthClass: 'good_length',
    tracking: 96, framesTracked: 42, framesTotal: 46,
    seed: 1,
  }),
  makeDelivery({
    id: 'd2', index: 2,
    paceVal: 88, paceLow: 85, paceHigh: 91, paceConf: 88,
    paceReason: 'Ball detected across 40/46 relevant frames with acceptable trajectory fit.',
    swingVal: 6, swingConf: 41, swingDir: 'uncertain',
    swingReason: 'Observed deviation (6cm) is close to tracking uncertainty (±5cm) -- not statistically distinguishable from noise.',
    lineVal: -0.08, lineConf: 94,
    lengthVal: 8.1, lengthConf: 95, lengthClass: 'short_of_length',
    tracking: 93, framesTracked: 40, framesTotal: 46,
    seed: 2,
  }),
  makeDelivery({
    id: 'd3', index: 3,
    paceVal: 96, paceLow: 94, paceHigh: 98, paceConf: 96,
    paceReason: 'Ball detected across 45/46 relevant frames, excellent lighting and stable camera.',
    swingVal: 3, swingConf: 22, swingDir: 'minimal',
    swingReason: 'Deviation of 3cm is within tracking uncertainty -- no swing reliably detected.',
    lineVal: 0.31, lineConf: 97,
    lengthVal: 3.2, lengthConf: 98, lengthClass: 'yorker',
    tracking: 98, framesTracked: 45, framesTotal: 46,
    seed: 3,
  }),
  makeDelivery({
    id: 'd4', index: 4,
    paceVal: 99, paceLow: 91, paceHigh: 107, paceConf: 42,
    paceReason: 'Ball obscured during release (frames 4-11) and again near the bounce. Wide range reflects low tracking confidence -- treat this reading with caution.',
    swingVal: 0, swingConf: null, swingDir: 'not_detected',
    swingReason: 'Insufficient tracked frames before the bounce to assess swing.',
    lineVal: 0.02, lineConf: 58,
    lengthVal: 7.4, lengthConf: 61, lengthClass: 'good_length',
    tracking: 44, framesTracked: 19, framesTotal: 46,
    occludedRanges: [{ start: 4, end: 11 }, { start: 24, end: 29 }],
    flagged: true, flagReason: 'Camera movement detected mid-delivery. Confidence reduced across all measurements.',
    seed: 4,
  }),
  makeDelivery({
    id: 'd5', index: 5,
    paceVal: 87, paceLow: 85, paceHigh: 89, paceConf: 93,
    paceReason: 'Ball detected across 44/46 relevant frames with very low trajectory error.',
    swingVal: 18, swingConf: 89, swingDir: 'inswing',
    swingReason: 'Lateral deviation of 18cm well exceeds estimated tracking uncertainty of ±4cm.',
    lineVal: 0.11, lineConf: 96,
    lengthVal: 6.2, lengthConf: 96, lengthClass: 'good_length',
    tracking: 97, framesTracked: 44, framesTotal: 46,
    seed: 5,
  }),
  makeDelivery({
    id: 'd6', index: 6,
    paceVal: 79, paceLow: 76, paceHigh: 82, paceConf: 90,
    paceReason: 'Ball detected across 41/46 relevant frames, slower delivery gives more frames per metre.',
    swingVal: 9, swingConf: 68, swingDir: 'outswing',
    swingReason: 'Deviation of 9cm moderately exceeds tracking uncertainty of ±5cm.',
    lineVal: -0.22, lineConf: 92,
    lengthVal: 9.6, lengthConf: 90, lengthClass: 'short',
    tracking: 90, framesTracked: 41, framesTotal: 46,
    seed: 6,
  }),
];

export const sampleSession: Session = {
  id: 'sample-session-1',
  createdAt: new Date().toISOString(),
  name: 'Sample session -- nets, evening light',
  calibration: {
    status: 'good',
    stumpsDetected: true,
    pitchDetected: true,
    groundPlaneDetected: true,
    pitchLengthMetres: 20.12,
    cameraQuality: 4,
    cameraQualityNote: 'Camera positioned close to the recommended 4m behind bowler-end stumps, full pitch visible.',
  },
  videoQuality: {
    score: 88,
    fps: 60,
    resolution: '1920x1080',
    motionBlur: 'low',
    lighting: 'moderate',
    stability: 'minor_movement',
    ballVisibility: 91,
    note: 'Good recording overall. Minor camera movement detected around delivery 4, which reduced confidence for that ball.',
  },
  status: 'complete',
  processingStage: 8,
  deliveries: sampleDeliveries,
  isSampleData: true,
};

export const emptySession: Session = {
  ...sampleSession,
  id: 'empty',
  name: 'New session',
  status: 'draft',
  deliveries: [],
  isSampleData: false,
};
