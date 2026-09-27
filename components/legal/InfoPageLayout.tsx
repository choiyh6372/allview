import type { ReactNode } from "react";

// 사이트 소개·문의·개인정보처리방침·이용약관 등 텍스트 위주 안내 페이지 공통 레이아웃
export default function InfoPageLayout({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
      {description && <p className="text-sm text-muted mt-2">{description}</p>}
      {updated && <p className="text-xs text-muted mt-1">시행일: {updated}</p>}
      <div className="mt-10 space-y-10 text-[15px] leading-7 text-gray-700">{children}</div>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function InfoList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
