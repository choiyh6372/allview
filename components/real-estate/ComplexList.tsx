import { MapPin } from "lucide-react";
import type { Complex } from "@/lib/realEstateData";

const regionColors: Record<string, string> = {
  오션시티: "text-blue-400",
  국제신도시: "text-purple-400",
  에코델타: "text-green-400",
};

type DataSource = "loading" | "real" | "empty";

interface Props {
  complexes: Complex[];
  selectedId: number;
  onSelect: (id: number) => void;
  sources?: Map<number, DataSource>;
}

const regions = ["오션시티", "국제신도시", "에코델타"];

function SourceDot({ source }: { source: DataSource }) {
  if (source === "loading") return <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse flex-shrink-0" />;
  if (source === "real") return <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />;
}

export default function ComplexList({ complexes, selectedId, onSelect, sources }: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-white">단지 목록</h2>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {regions.map((region) => {
          const group = complexes.filter((c) => c.region === region);
          if (!group.length) return null;
          return (
            <div key={region}>
              <div className="px-4 py-2 bg-bg/50">
                <span className={`text-xs font-bold ${regionColors[region] ?? "text-muted"}`}>
                  {region}
                </span>
              </div>
              {group.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedId === c.id
                      ? "bg-accent/10 border-l-2 border-accent"
                      : "hover:bg-bg-hover border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-medium ${selectedId === c.id ? "text-accent" : "text-gray-200"}`}>
                      {c.name}
                    </p>
                    {sources && <SourceDot source={sources.get(c.id) ?? "loading"} />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-muted" />
                    <span className="text-xs text-muted">{c.region}</span>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
