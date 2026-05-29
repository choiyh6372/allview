import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted gap-2">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">불러오는 중...</span>
    </div>
  );
}
