import type { Complex } from "@/lib/realEstateData";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
  return `${v.toLocaleString()}만`;
}

interface Props {
  complex: Complex;
}

export default function TransactionTable({ complex }: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">최근 거래내역</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-400">국토부 실거래</span>
          <span className="text-xs text-muted">총 {complex.transactions.length}건</span>
        </div>
      </div>
      {complex.transactions.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted">
          거래 내역이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted">거래일</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">면적</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">층</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted">거래가</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {complex.transactions.map((t, i) => (
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
      )}
    </div>
  );
}
