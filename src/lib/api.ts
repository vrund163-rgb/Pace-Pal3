// Talks to the real Pace Pal backend (see /pace-pal-backend). The base URL
// comes from an environment variable so it's a one-line change when you
// redeploy the backend somewhere else -- see .env.example.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function isBackendConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export async function uploadVideo(file: File): Promise<{ sessionId: string }> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/sessions/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getSessionStatus(sessionId: string): Promise<any> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export function getFrameUrl(sessionId: string, index = 0): string {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  return `${API_BASE_URL}/api/sessions/${sessionId}/frame?index=${index}`;
}

export async function trackFromPoint(
  sessionId: string,
  req: { frame: number; x: number; y: number; direction: 'both' | 'forward' | 'backward' },
): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/track-from-point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Tracking request failed: ${res.status} ${await res.text()}`);
}

export interface CalibrationPoints {
  mode: 'creases' | 'stumps';
  bowlerLeft: [number, number];
  bowlerRight: [number, number];
  batterLeft: [number, number];
  batterRight: [number, number];
}

export async function submitCalibration(sessionId: string, points: CalibrationPoints): Promise<any> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/calibrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(points),
  });
  if (!res.ok) throw new Error(`Calibration failed: ${res.status} ${await res.text()}`);
  return res.json();
}
