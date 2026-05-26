// 강서구 kaptCode 목록 조회 → 각 단지 기본정보(세대수, 건축연도, 주차대수) 출력
const API_KEY = "39a990dd250e992b303d7a6a3bcc8d9a5b73d019db35d073d5b46ffe59f89518";

// 1단계: 부산(26) 전체 단지 → as2==="강서구" 필터
async function fetchGangseoKaptList() {
  const result = [];
  let pageNo = 1;
  const numOfRows = 1000;
  let totalCount = Infinity;

  while ((pageNo - 1) * numOfRows < totalCount) {
    const url = new URL("https://apis.data.go.kr/1613000/AptListService3/getSidoAptList3");
    url.searchParams.set("serviceKey", API_KEY);
    url.searchParams.set("sidoCode", "26");
    url.searchParams.set("numOfRows", String(numOfRows));
    url.searchParams.set("pageNo", String(pageNo));

    const res = await fetch(url.toString());
    const json = await res.json();
    const body = json?.response?.body;
    totalCount = body?.totalCount ?? 0;
    const items = body?.items ?? [];

    const gangseo = items.filter(i => i.as2 === "강서구");
    result.push(...gangseo);
    process.stderr.write(`  페이지 ${pageNo}: ${items.length}개 (강서구: ${gangseo.length}개, 누적: ${result.length}개 / 총 ${totalCount}개)\n`);

    if (items.length < numOfRows) break;
    pageNo++;
  }

  return result;
}

// 2단계: 단지 기본정보 (AptBasisInfoServiceV4)
async function fetchKaptInfo(kaptCode) {
  const url = new URL("https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4");
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("kaptCode", kaptCode);

  const res = await fetch(url.toString());
  try {
    const json = await res.json();
    return json?.response?.body?.item ?? {};
  } catch {
    return {};
  }
}

// 실행
process.stderr.write("=== 부산 강서구 단지 목록 조회 중... ===\n");
const aptList = await fetchGangseoKaptList();
process.stderr.write(`\n강서구 단지 총 ${aptList.length}개. 기본정보 조회 시작...\n\n`);

const results = [];
for (let i = 0; i < aptList.length; i++) {
  const { kaptCode, kaptName, as3 } = aptList[i];
  process.stderr.write(`[${i + 1}/${aptList.length}] ${kaptName} (${kaptCode})\n`);

  const info = await fetchKaptInfo(kaptCode);
  results.push({
    kaptCode,
    단지명:    info.kaptName    || kaptName,
    동:        as3              || "",
    세대수:    info.hoCnt       || info.kaptdaCnt || "",   // hoCnt = 세대수, kaptdaCnt = 동일값
    사용승인일: info.kaptUsedate || "",                    // YYYYMMDD
    건축연도:  info.kaptUsedate ? info.kaptUsedate.substring(0, 4) : "",
    주차대수:  info.kaptdaCnt   || "",                    // kaptdaCnt 확인 필요
    연면적:    info.kaptTarea   || "",
    동수:      info.kaptDongCnt || "",
    도로명주소: info.doroJuso   || "",
  });
  await new Promise(r => setTimeout(r, 50));
}

// 결과 출력 (탭 구분)
console.log("kaptCode\t단지명\t동\t세대수(hoCnt)\t사용승인일\t건축연도\t주차대수(kaptdaCnt)\t연면적(㎡)\t동수\t도로명주소");
for (const r of results) {
  console.log([
    r.kaptCode, r.단지명, r.동, r.세대수, r.사용승인일,
    r.건축연도, r.주차대수, r.연면적, r.동수, r.도로명주소
  ].join("\t"));
}
process.stderr.write(`\n완료: ${results.length}개 단지\n`);
