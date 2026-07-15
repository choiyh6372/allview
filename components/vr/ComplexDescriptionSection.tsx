"use client";

import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import type { TocItem } from "@/lib/sanitizeDescriptionHtml";

const COLLAPSE_HEIGHT = 480;

export default function ComplexDescriptionSection({
  title,
  intro,
  body,
  toc,
  collapsible,
}: {
  title: string;
  intro: string;
  body: string;
  toc: TocItem[];
  collapsible: boolean;
}) {
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <article className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title} 단지 소개</h2>

      <div className="rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
        {intro && (
          <div className="complex-description mb-6" dangerouslySetInnerHTML={{ __html: intro }} />
        )}

        {toc.length > 1 && (
          <nav className="mb-6 pb-6 border-b border-border">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              <List size={13} /> 목차
            </p>
            <ol className="space-y-1.5">
              {toc.map((item, i) => (
                <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-gray-700 hover:text-accent transition-colors"
                  >
                    {item.level === 2 ? `${i + 1}. ` : ""}
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="relative">
          <div
            style={!expanded ? { maxHeight: COLLAPSE_HEIGHT, overflow: "hidden" } : undefined}
          >
            <div className="complex-description" dangerouslySetInnerHTML={{ __html: body }} />
          </div>
          {!expanded && (
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-card via-bg-card/90 to-transparent flex items-end justify-center pb-1 pointer-events-none">
              <button
                onClick={() => setExpanded(true)}
                className="pointer-events-auto flex items-center gap-1.5 px-5 py-2.5 bg-bg-card border border-border hover:border-accent/40 rounded-full text-sm font-semibold text-gray-900 shadow-sm transition-colors"
              >
                더보기 <ChevronDown size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
