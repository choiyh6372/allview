const API_KEY = "39a990dd250e992b303d7a6a3bcc8d9a5b73d019db35d073d5b46ffe59f89518";

const kaptCodes = [
  // ocean
  "A61870409","A61870410","A61870411","A61881402","A61820001","A61870406","A61870405","A61870404","A10028117","A10028079",
  // kukje
  "A10027656","A10027581","A10027953","A10025684","A10027698","A10027139","A10027280","A10027282","A10026445","A10027918","A10027621","A10025932","A10025776","A10026157","A10025343","A10024697","A10024664",
  // jisa
  "A10028069","A61823002","A61823001",
  // ecodelta
  "A10022696","A10022541","A10020378","A10020645","A10020649","A10020569","A10020264",
];

async function fetchKaptAddr(kaptCode) {
  const url = new URL("https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4");
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("kaptCode", kaptCode);
  const res = await fetch(url.toString());
  const json = await res.json();
  const item = json?.response?.body?.item ?? {};
  return { kaptCode, kaptAddr: item.kaptAddr ?? "", kaptName: item.kaptName ?? "" };
}

for (const code of kaptCodes) {
  const r = await fetchKaptAddr(code);
  console.log(`${r.kaptCode}\t${r.kaptName}\t${r.kaptAddr}`);
  await new Promise(r => setTimeout(r, 80));
}
