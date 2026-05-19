import { ExternalLink, MapPin, Phone } from "lucide-react";
import type { Store } from "@/lib/storeData";

const categoryColors: Record<string, string> = {
  카페: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  마트: "bg-green-500/10 text-green-400 border-green-500/20",
  헬스: "bg-red-500/10 text-red-400 border-red-500/20",
  음식점: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  약국: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  미용: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  키즈: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  베이커리: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  세탁: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  병원: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  학원: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const regionColors: Record<string, string> = {
  오션시티: "text-blue-400",
  국제신도시: "text-purple-400",
  에코델타: "text-green-400",
};

interface Props {
  store: Store;
}

export default function StoreCard({ store }: Props) {
  const catColor = categoryColors[store.category] ?? "bg-accent/10 text-accent border-accent/20";
  const regColor = regionColors[store.region] ?? "text-muted";

  return (
    <div className="group bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/40 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${catColor}`}>
          {store.category}
        </span>
        <div className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold">
          ★ {store.rating}
        </div>
      </div>

      <h3 className="text-sm font-bold text-white mb-1 truncate">{store.name}</h3>

      <div className="flex items-center gap-1 mb-1">
        <MapPin size={10} className={regColor} />
        <span className={`text-xs ${regColor}`}>{store.region}</span>
      </div>

      <p className="text-xs text-muted mb-3 flex-1 line-clamp-2">{store.address}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {store.tags.slice(0, 3).map((t) => (
          <span key={t} className="text-xs px-1.5 py-0.5 bg-bg-hover rounded text-muted">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-3 text-xs text-muted">
        <Phone size={10} />
        {store.phone}
      </div>

      <a
        href={store.naverUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#03C75A]/10 hover:bg-[#03C75A]/20 border border-[#03C75A]/20 text-[#03C75A] rounded-xl text-xs font-semibold transition-colors"
      >
        <ExternalLink size={11} />
        네이버 플레이스
      </a>
    </div>
  );
}
