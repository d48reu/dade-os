import Navigation from "@/components/Navigation";
import RetroWindow from "@/components/ui/RetroWindow";

const CONNECTORS = [
  {
    id: "MDC-GIS",
    name: "Miami-Dade GIS REST",
    url: "gis.miamidade.gov",
    status: "READY",
    ok: true,
  },
  {
    id: "MDC-311",
    name: "311 Service Requests",
    url: "opendata.miamidade.gov",
    status: "READY",
    ok: true,
  },
  {
    id: "MDC-BUD",
    name: "County Budget Data",
    url: "opendata.miamidade.gov",
    status: "READY",
    ok: true,
  },
  {
    id: "MAPBOX",
    name: "Mapbox Terrain/Tiles",
    url: "api.mapbox.com",
    status: "NEEDS TOKEN",
    ok: false,
  },
  {
    id: "CLAUDE",
    name: "Anthropic Claude API",
    url: "api.anthropic.com",
    status: "NEEDS KEY",
    ok: false,
  },
];

export default function DataPage() {
  return (
    <>
      <Navigation />
      <div className="flex-1 p-4 flex flex-col gap-4 min-h-0">
        <RetroWindow
          title="Data Connectors — Miami-Dade Sources"
          badge={{ text: "GIS", variant: "green" }}
          live
          className="flex-1"
        >
          <div className="space-y-3">
            <p className="text-dade-dim text-xs tracking-wider mb-4">
              Available data pipelines and API connections for DADE/OS.
            </p>

            {CONNECTORS.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 p-3 border border-dade-border hover:border-dade-blue transition-colors"
              >
                <span
                  className="badge badge-blue w-20 text-center flex-shrink-0"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  {c.id}
                </span>
                <div className="flex-1">
                  <div className="text-dade-text text-xs">{c.name}</div>
                  <div className="text-dade-dim text-xs">{c.url}</div>
                </div>
                <span
                  className={`text-xs ${c.ok ? "terminal-ok" : "terminal-warn"}`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </RetroWindow>
      </div>
    </>
  );
}
