import type { Complex, RentTransaction } from "@/lib/realEstateData";

function fmt(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(2)}억`;
  return `${v.toLocaleString()}만`;
}

function RentPrice({ deposit, monthlyRent }: { deposit: number; monthlyRent: number }) {
  if (monthlyRent === 0) {
    return <span className="font-semibold text-inherit">{fmt(deposit)}</span>;
  }
  return (
    <span className="font-semibold text-inherit">
      {fmt(deposit)} / {monthlyRent.toLocaleString()}만
    </span>
  );
}

function RentBadge({ monthlyRent }: { monthlyRent: number }) {
  if (monthlyRent === 0) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">전세</span>
    );
  }
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">월세</span>
  );
}

interface Props {
  complex: Complex;
  rentTransactions: RentTransaction[];
  selectedArea: string;
  light?: boolean;
}

export default function TransactionTable({ complex, rentTransactions, selectedArea, light }: Props) {
  const tradeRows = selectedArea
    ? complex.transactions.filter((t) => t.area === selectedArea)
    : complex.transactions;
  const rentRows = selectedArea
    ? rentTransactions.filter((t) => t.area === selectedArea)
    : rentTransactions;

  const card   = light ? "bg-white border-gray-200"   : "bg-bg-card border-border";
  const divRow = light ? "divide-gray-100"             : "divide-border";
  const hdr    = light ? "border-b border-gray-200"    : "border-b border-border";
  const stickyBg = light ? "bg-white"                 : "bg-bg-card";
  const hover  = light ? "hover:bg-gray-50"            : "hover:bg-bg-hover";
  const txt    = light ? "text-gray-900"               : "text-white";
  const sub    = light ? "text-gray-500"               : "text-muted";
  const cell   = light ? "text-gray-700"               : "text-gray-300";

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 매매 */}
      <div className={`${card} border rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 ${hdr} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${txt}`}>매매</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-500">국토부 실거래</span>
            <span className={`text-xs ${sub}`}>총 {tradeRows.length}건</span>
          </div>
        </div>
        {tradeRows.length === 0 ? (
          <div className={`px-6 py-10 text-center text-sm ${sub}`}>거래 내역이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${stickyBg}`}>
                <tr className={hdr}>
                  <th className={`text-left px-6 py-3 text-xs font-medium ${sub}`}>거래일</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub}`}>면적</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub}`}>층</th>
                  <th className={`text-right px-6 py-3 text-xs font-medium ${sub}`}>거래가</th>
                </tr>
              </thead>
            </table>
            <div className="h-[440px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className={`divide-y ${divRow}`}>
                  {tradeRows.map((t, i) => (
                    <tr key={i} className={`${hover} transition-colors`}>
                      <td className={`px-6 py-3 ${cell}`}>{t.date}</td>
                      <td className={`px-4 py-3 text-right ${cell}`}>{t.area}㎡</td>
                      <td className={`px-4 py-3 text-right ${sub}`}>{t.floor}층</td>
                      <td className={`px-6 py-3 text-right ${txt}`}>
                        <span className="font-semibold">{fmt(t.price)}</span>
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
      <div className={`${card} border rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 ${hdr} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${txt}`}>전월세</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-500">국토부 실거래</span>
            <span className={`text-xs ${sub}`}>총 {rentRows.length}건</span>
          </div>
        </div>
        {rentRows.length === 0 ? (
          <div className={`px-6 py-10 text-center text-sm ${sub}`}>거래 내역이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${stickyBg}`}>
                <tr className={hdr}>
                  <th className={`text-left px-4 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>거래일</th>
                  <th className={`text-right px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>면적</th>
                  <th className={`text-right px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>층</th>
                  <th className={`text-right px-3 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>유형</th>
                  <th className={`text-right px-4 py-3 text-xs font-medium ${sub} whitespace-nowrap`}>보증금/월세</th>
                </tr>
              </thead>
            </table>
            <div className="h-[440px] overflow-y-auto">
              <table className={`w-full text-sm ${txt}`}>
                <tbody className={`divide-y ${divRow}`}>
                  {rentRows.map((t, i) => (
                    <tr key={i} className={`${hover} transition-colors`}>
                      <td className={`px-4 py-3 ${cell} whitespace-nowrap`}>{t.date}</td>
                      <td className={`px-3 py-3 text-right ${cell} whitespace-nowrap`}>{t.area}㎡</td>
                      <td className={`px-3 py-3 text-right ${sub} whitespace-nowrap`}>{t.floor}층</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <RentBadge monthlyRent={t.monthlyRent} />
                      </td>
                      <td className={`px-4 py-3 text-right ${txt} whitespace-nowrap`}>
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
