import type { Complex, RentTransaction } from "@/lib/realEstateData";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
  return `${v.toLocaleString()}만`;
}

function RentPrice({ deposit, monthlyRent }: { deposit: number; monthlyRent: number }) {
  if (monthlyRent === 0) {
    return <span className="font-semibold text-white">{fmt(deposit)}</span>;
  }
  return (
    <span className="font-semibold text-white">
      {fmt(deposit)} / {monthlyRent.toLocaleString()}만
    </span>
  );
}

function RentBadge({ monthlyRent }: { monthlyRent: number }) {
  if (monthlyRent === 0) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">전세</span>
    );
  }
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">월세</span>
  );
}

interface Props {
  complex: Complex;
  rentTransactions: RentTransaction[];
  selectedArea: string;
}

export default function TransactionTable({ complex, rentTransactions, selectedArea }: Props) {
  const tradeRows = selectedArea
    ? complex.transactions.filter((t) => t.area === selectedArea)
    : complex.transactions;
  const rentRows = selectedArea
    ? rentTransactions.filter((t) => t.area === selectedArea)
    : rentTransactions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4">
      {/* 매매 */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">매매</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-500">국토부 실거래</span>
            <span className="text-xs text-muted">총 {tradeRows.length}건</span>
          </div>
        </div>
        {tradeRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted">거래 내역이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-card">
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted">거래일</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted">면적</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted">층</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted">거래가</th>
                </tr>
              </thead>
            </table>
            <div className="h-[440px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {tradeRows.map((t, i) => (
                    <tr key={i} className="hover:bg-bg-hover transition-colors">
                      <td className="px-6 py-3 text-gray-300">{t.date}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{t.area}㎡</td>
                      <td className="px-4 py-3 text-right text-muted">{t.floor}층</td>
                      <td className="px-6 py-3 text-right">
                        <span className="font-semibold text-white">{fmt(t.price)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 전월세 */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">전월세</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400">국토부 실거래</span>
            <span className="text-xs text-muted">총 {rentRows.length}건</span>
          </div>
        </div>
        {rentRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted">거래 내역이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-card">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted whitespace-nowrap">거래일</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-muted whitespace-nowrap">면적</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-muted whitespace-nowrap">층</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-muted whitespace-nowrap">유형</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted whitespace-nowrap">보증금/월세</th>
                </tr>
              </thead>
            </table>
            <div className="h-[440px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {rentRows.map((t, i) => (
                    <tr key={i} className="hover:bg-bg-hover transition-colors">
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{t.date}</td>
                      <td className="px-3 py-3 text-right text-gray-300 whitespace-nowrap">{t.area}㎡</td>
                      <td className="px-3 py-3 text-right text-muted whitespace-nowrap">{t.floor}층</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <RentBadge monthlyRent={t.monthlyRent} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <RentPrice deposit={t.deposit} monthlyRent={t.monthlyRent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
