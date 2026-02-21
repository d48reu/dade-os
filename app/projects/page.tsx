import Navigation from "@/components/Navigation";
import RetroWindow from "@/components/ui/RetroWindow";

export default function ProjectsPage() {
  return (
    <>
      <Navigation />
      <div className="flex-1 p-4 flex flex-col gap-4 min-h-0">
        <RetroWindow
          title="Projects — Workspace Manager"
          badge={{ text: "WIP", variant: "amber" }}
          className="flex-1"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="text-2xl glow-purple mb-3"
                style={{ fontFamily: "Orbitron, monospace", fontWeight: 700 }}
              >
                PROJECTS
              </div>
              <p className="text-dade-dim text-xs tracking-widest mb-2">
                Workspace management coming soon.
              </p>
              <p className="text-dade-dim text-xs">
                Organize civic data projects, briefs, and reports.
              </p>
            </div>
          </div>
        </RetroWindow>
      </div>
    </>
  );
}
