export default function NewsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-bg-card rounded-xl" />
        <div>
          <div className="h-7 w-32 bg-bg-card rounded-lg mb-2" />
          <div className="h-4 w-48 bg-bg-card rounded" />
        </div>
      </div>

      {/* 2열 그리드 카드 10개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="h-5 w-full bg-bg-hover rounded" />
            <div className="h-5 w-3/4 bg-bg-hover rounded" />
            <div className="h-3 w-1/2 bg-bg-hover rounded mt-1" />
            <div className="h-3 w-28 bg-bg-hover rounded mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
