// NOAA Weather Alerts for Miami-Dade County
const NOAA_URL =
  'https://api.weather.gov/alerts/active?zone=FLZ073,FLZ074,FLZ173';

export interface NOAAAlert {
  id: string;
  event: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme' | 'Unknown';
  urgency: string;
  headline: string;
  onset: string;
  expires: string;
  senderName: string;
}

export async function fetchNOAAAlerts(): Promise<NOAAAlert[]> {
  const res = await fetch(NOAA_URL, {
    headers: { 'User-Agent': 'DADE-OS/0.1 (civic-data-dashboard)' },
  });
  if (!res.ok) throw new Error(`NOAA API error: ${res.status}`);
  const json = await res.json();

  return (json.features || []).map((f: Record<string, Record<string, string>>) => ({
    id: f.properties.id,
    event: f.properties.event,
    severity: f.properties.severity,
    urgency: f.properties.urgency,
    headline: f.properties.headline,
    onset: f.properties.onset,
    expires: f.properties.expires,
    senderName: f.properties.senderName,
  }));
}

// MDFR Fire Rescue active calls — scraped server-side
export interface FireCall {
  time: string;
  code: string;
  type: string;
  address: string;
  units: string;
  district: string;
}

export async function fetchFireCalls(): Promise<FireCall[]> {
  const res = await fetch('/api/fire-calls');
  if (!res.ok) throw new Error(`Fire calls API error: ${res.status}`);
  return res.json();
}
