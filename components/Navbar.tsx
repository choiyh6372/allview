"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "홈" },
  { href: "/vr-tour", label: "VR투어" },
  { href: "/real-estate", label: "실거래가" },
  { href: "/subscription", label: "분양정보" },
  { href: "/map", label: "지도" },
  { href: "/market", label: "시장동향" },
  { href: "/news", label: "강서구뉴스" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-accent tracking-tight">All</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">View</span>
            <span className="text-2xl font-black text-accent tracking-tight">360</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-accent text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-bg-hover"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden text-gray-700 hover:text-gray-900"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-indigo-50 shadow-lg">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-accent bg-bg-hover"
                  : "text-gray-700 hover:text-gray-900 hover:bg-bg-hover"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
