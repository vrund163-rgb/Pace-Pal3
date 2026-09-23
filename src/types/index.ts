// Core data model for Pace Pal.
// This shape is the contract the frontend expects from a processing backend.
// Every measurement carries a value, a likely range, a confidence score,
// and a plain-language reason -- never a bare number presented as exact.

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient';

export interface Measurement {
  value: number | null;
  unit: string;
  rangeLow: number | null;
  rangeHigh: number | null;
  confidence: number | null; // 0-100, null if not statistically justified
  confidenceLevel: ConfidenceLevel;
  reason: string;
}

export type SwingDirection = 'inswing' | 'outswing' | 'minimal' | 'uncertain' | 'not_detected';

export type DeliveryLengthClass =
  | 'yorker'
  | 'full'
  | 'good_length'
  | 'short_of_length'
  | 'short';

export interface TrajectoryPoint {
  frame: number;
  t: number; // seconds from release
  x: number; // lateral, metres from centreline
  y: number; // distance down pitch, metres from bowling stumps
  z: number; // height, metres
  occluded: boolean;
}

export interface Delivery {
  id: string;
  sessionId: string;
  index: number;
  timestamp: string;
  releaseFrame: number;
  bounceFrame: number;
  batterFrame: number;
  trackingQuality: number; // 0-100
  pace: Measurement;
  swing: Measurement & { direction: SwingDirection };
  line: Measurement; // +ve = outside off, -ve = leg side, from centreline
  length: Measurement;
  lengthClass: DeliveryLengthClass | null;
  spinDetected: boolean;
  spinNote: string;
  framesTracked: number;
  framesTotal: number;
  occludedRanges: { start: number; end: number }[];
  flagged: boolean;
  flagReason: string | null;
  included: boolean;
  videoClipUrl: string | null;
  trajectory: TrajectoryPoint[];
  qualityBreakdown: {
    tracking: number;
    calibration: number;
    trajectory: number;
    pace: number;
    overall: number;
  };
}

export interface CalibrationState {
  status: 'not_started' | 'in_progress' | 'good' | 'acceptable' | 'poor';
  stumpsDetected: boolean;
  pitchDetected: boolean;
  groundPlaneDetected: boolean;
  pitchLengthMetres: number | null;
  cameraQuality: 0 | 1 | 2 | 3 | 4 | 5;
  cameraQualityNote: string;
}

export interface VideoQuality {
  score: number; // 0-100
  fps: number;
  resolution: string;
  motionBlur: 'low' | 'moderate' | 'high';
  lighting: 'good' | 'moderate' | 'poor';
  stability: 'stable' | 'minor_movement' | 'unstable';
  ballVisibility: number; // 0-100
  note: string;
}

export interface Session {
  id: string;
  createdAt: string;
  name: string;
  calibration: CalibrationState;
  videoQuality: VideoQuality;
  status: 'draft' | 'recording' | 'processing' | 'complete';
  processingStage: number; // index into PROCESSING_STAGES
  deliveries: Delivery[];
  isSampleData: boolean;
}

export const PROCESSING_STAGES = [
  'Video uploaded',
  'Camera calibrated',
  'Pitch detected',
  'Deliveries detected',
  'Ball trajectories reconstructed',
  'Pace calculated',
  'Swing analysed',
  'Pitch map generated',
  'Delivery clips generated',
] as const;

export function confidenceLevelFromScore(score: number | null): ConfidenceLevel {
  if (score === null) return 'insufficient';
  if (score >= 85) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
