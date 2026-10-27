import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-0.5 mb-3">
              <span className="text-xl font-black text-accent">All</span>
              <span className="text-xl font-black text-gray-900">View</span>
              <span className="text-xl font-black text-accent">360</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              부산 강서구 부동산 통합 플랫폼<br />
              VR투어 · 실거래가 · 분양정보 · 지도보기
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">서비스</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {[
                { href: "/vr-tour", label: "VR투어" },
                { href: "/real-estate", label: "실거래가" },
                { href: "/subscription", label: "분양정보" },
                { href: "/map", label: "지도보기" },
                { href: "/blog", label: "블로그" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-accent transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
          <p className="text-xs text-muted">
            본 사이트에서 제공되는 VR 투어 영상 및 이미지 콘텐츠의 저작권은 AllView360에 있으며,
            무단 복제·배포·전송을 금합니다.
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { href: "/about", label: "사이트 소개" },
              { href: "/contact", label: "문의하기" },
              { href: "/credits", label: "데이터 출처" },
              { href: "/terms", label: "이용약관" },
              { href: "/privacy", label: "개인정보처리방침" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-xs hover:text-accent transition-colors ${
                  l.href === "/privacy" ? "font-semibold text-gray-900" : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted">© 2026 AllView360(올뷰360). All rights reserved.</p>
            <p className="text-xs text-muted">부산광역시 강서구</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
