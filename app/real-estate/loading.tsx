export default function RealEstateLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* 헤더 */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="h-9 w-48 bg-bg-card rounded-lg mb-3" />
          <div className="h-4 w-64 bg-bg-card rounded" />
        </div>
        <div className="h-7 w-52 bg-bg-card rounded-lg" />
      </div>

      {/* 탭 */}
      <div className="h-10 w-44 bg-bg-card rounded-xl mb-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 단지 목록 */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-bg-card border border-border rounded-2xl p-3 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-bg-hover rounded-xl" />
            ))}
          </div>
        </aside>

        {/* 그래프 + 테이블 */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* 그래프 카드 */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-bg-hover rounded" />
              <div className="h-8 w-28 bg-bg-hover rounded-lg" />
            </div>
            <div className="h-64 bg-bg-hover rounded-xl" />
          </div>

          {/* 테이블 카드 */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="h-5 w-24 bg-bg-hover rounded mb-4" />
            <div className="space-y-3">
              <div className="h-8 bg-bg-hover rounded-lg" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-bg-hover rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
