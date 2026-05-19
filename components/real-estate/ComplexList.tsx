import { MapPin } from "lucide-react";
import type { Complex } from "@/lib/realEstateData";

interface Props {
  complexes: Complex[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

export default function ComplexList({ complexes, selectedId, onSelect, isLoading }: Props) {
  const regions = Array.from(new Set(complexes.map((c) => c.region))).sort(
    (a, b) => a.localeCompare(b, "ko")
  );

  return (
    <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-white">단지 목록</h2>
      </div>

      {isLoading ? (
        <div className="px-4 py-8 text-center text-xs text-muted animate-pulse">
          단지 목록 불러오는 중...
        </div>
      ) : complexes.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-muted">
          단지 정보가 없습니다
        </div>
      ) : (
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {regions.map((region) => (
            <div key={region}>
              <div className="px-4 py-2 bg-bg/50">
                <span className="text-xs font-bold text-muted">{region}</span>
              </div>
              {complexes
                .filter((c) => c.region === region)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedId === c.id
                        ? "bg-accent/10 border-l-2 border-accent"
                        : "hover:bg-bg-hover border-l-2 border-transparent"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedId === c.id ? "text-accent" : "text-gray-200"
                      }`}
                    >
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-muted" />
                      <span className="text-xs text-muted">{c.region}</span>
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
