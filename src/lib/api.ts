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
