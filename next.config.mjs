// 예전 워드프레스 블로그(2018~2021) 글 중 지금 페이지와 주제가 같은 주소를 영구 리디렉션
// (검색엔진에 남은 옛 주소의 신뢰도를 새 페이지로 넘기기 위함)
const LEGACY_POSTS = [
  { from: "/2021/02/13/명지엘크루블루오션", to: "/vr-tour/ocean/blueocean4" },
  { from: "/2021/05/26/서부산-부산광역시-재개발-재건축-정비예정구역입니다", to: "/map" },
  { from: "/2021/05/21/krpano-프로그램으로-360vr-tour-만들기", to: "/vr-tour" },
];

// 한글 경로는 인코딩된 형태로도 요청되므로 두 형태 모두 등록
const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    const posts = LEGACY_POSTS.flatMap(({ from, to }) => {
      const sources = [...new Set([from, encodePath(from)])];
      return sources.map((source) => ({ source, destination: to, permanent: true }));
    });
    return [
      ...posts,
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/comments/feed", destination: "/rss.xml", permanent: true },
    ];
  },
};

export default nextConfig;
