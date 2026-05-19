const stats = [
  { value: "3", unit: "개 지역", label: "서비스 지역" },
  { value: "127", unit: "개 단지", label: "VR투어 가능 단지" },
  { value: "48,000+", unit: "건", label: "실거래 데이터" },
  { value: "2,400+", unit: "개", label: "등록 가게" },
];

export default function StatsSection() {
  return (
    <section className="py-16 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-3xl sm:text-4xl font-black text-accent">{s.value}</span>
                <span className="text-sm text-muted mb-1">{s.unit}</span>
              </div>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
