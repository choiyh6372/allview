// 관리자가 전체 HTML 문서(<!DOCTYPE>, <head>, <style> 포함)를 통째로 붙여넣는 경우,
// <style>이 페이지 전역에 leak되고 <html>/<head>/<body>가 중첩되어 레이아웃이 깨진다.
// 본문만 남기고 문서 래퍼·style·script·메타 태그를 제거한다.
export function sanitizeDescriptionHtml(html: string): string {
  let out = html;

  const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    out = bodyMatch[1];
  } else {
    out = out.replace(/<!DOCTYPE[^>]*>/gi, "");
    out = out.replace(/<head[\s\S]*?<\/head>/gi, "");
    out = out.replace(/<\/?html[^>]*>/gi, "");
  }

  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<title[\s\S]*?<\/title>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/<link[^>]*>/gi, "");

  out = unwrapOuterWrapper(out.trim());

  return out.trim();
}

// 전체 내용이 <article>...</article> 나 <div>...</div> 하나로 통째로 감싸여 있으면 벗겨낸다.
// (안 벗기면 뒤에서 목차를 끼워 넣을 때 태그 짝이 안 맞아 hydration 에러가 난다)
function unwrapOuterWrapper(html: string): string {
  let out = html;
  for (let i = 0; i < 3; i++) {
    const m = out.match(/^<(article|div|section)(?:\s[^>]*)?>([\s\S]*)<\/\1>\s*$/i);
    if (!m) break;
    out = m[2].trim();
  }
  return out;
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

// h2/h3에 id를 부여하고 목차를 뽑아낸다. 렌더링될 HTML은 그대로 유지하면서(SEO용 전체 텍스트 보존)
// 화면에서는 목차 앵커 + 접기/펼치기 UI로 사용한다.
export function extractHeadings(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let counter = 0;
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "").trim();
    if (!text) return _match;
    counter += 1;
    const id = `section-${counter}`;
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    const cleanAttrs = String(attrs).replace(/\sid="[^"]*"/i, "");
    return `<h${level} id="${id}"${cleanAttrs}>${inner}</h${level}>`;
  });
  return { html: out, toc };
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// 첫 <h2> 앞부분(제목·인트로 문단)과 그 뒤(본문 섹션들)를 분리한다.
// 태그 중첩 깊이를 추적해서, 깊이 0(최상위)에 있는 h2에서만 자른다.
// 그래야 짝이 안 맞는 위치에서 잘라 hydration 에러가 나는 걸 막을 수 있다.
export function splitAtFirstH2(html: string): { intro: string; rest: string } {
  const tagRe = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(html)) !== null) {
    const full = match[0];
    if (full.startsWith("<!--")) continue;
    const tagName = match[1]?.toLowerCase();
    if (!tagName) continue;

    const isClosing = full.startsWith("</");
    const isSelfClosing = /\/>\s*$/.test(full) || VOID_ELEMENTS.has(tagName);

    if (!isClosing && tagName === "h2" && depth === 0) {
      return { intro: html.slice(0, match.index).trim(), rest: html.slice(match.index) };
    }

    if (isClosing) {
      depth = Math.max(0, depth - 1);
    } else if (!isSelfClosing) {
      depth += 1;
    }
  }

  return { intro: "", rest: html };
}
