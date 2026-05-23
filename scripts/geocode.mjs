// 카카오 주소 검색 REST API로 좌표 변환
const KAKAO_KEY = '76e1cda8071b56b79720e30e2b82c998';

const entries = [
  { id: 'ocean_blueocean',       address: '부산 강서구 명지오션시티12로 92' },
  { id: 'ocean_doosan',          address: '부산 강서구 명지오션시티11로 22' },
  { id: 'ocean_hansin',          address: '부산 강서구 명지오션시티1로 155' },
  { id: 'ocean_kukdong',         address: '부산 강서구 명지오션시티2로 71' },
  { id: 'ocean_lotte',           address: '부산 강서구 명지오션시티11로 84' },
  { id: 'ocean_qweendom_edison', address: '부산 강서구 명지오션시티10로 17' },
  { id: 'ocean_qweendom_lincoln',address: '부산 강서구 명지오션시티10로 16' },
  { id: 'ocean_qweendom_einstein',address:'부산 강서구 명지오션시티11로 51' },
  { id: 'ocean_samjung',         address: '부산 강서구 명지오션시티10로 114' },
  { id: 'ocean_solmare',         address: '부산 강서구 명지오션시티12로 10' },

  { id: 'kukje_daebang1',  address: '부산 강서구 명지국제5로 30' },
  { id: 'kukje_daebang2',  address: '부산 강서구 명지국제5로 11' },
  { id: 'kukje_eileen',    address: '부산 강서구 명지국제5로 60' },
  { id: 'kukje_elife',     address: '부산 강서구 명지국제2로 80' },
  { id: 'kukje_hoban2',    address: '부산 강서구 명지국제5로 89' },
  { id: 'kukje_hyupsung',  address: '부산 강서구 명지국제5로 141' },
  { id: 'kukje_jungheung1',address: '부산 강서구 명지국제7로 133' },
  { id: 'kukje_jungheung2',address: '부산 강서구 명지국제5로 90' },
  { id: 'kukje_kumkang1',  address: '부산 강서구 명지국제5로 59' },
  { id: 'kukje_kumkang2',  address: '부산 강서구 명지국제5로 109' },
  { id: 'kukje_kumkang3',  address: '부산 강서구 명지국제5로 110' },
  { id: 'kukje_thehill',   address: '부산 강서구 명지국제7로 110' },
  { id: 'kukje_thewestern',address: '부산 강서구 명지국제7로 111' },
  { id: 'kukje_samjung',   address: '부산 강서구 명지국제3로 97' },
  { id: 'kukje_posco2',    address: '부산 강서구 명지국제7로 37' },
  { id: 'kukje_posco3',    address: '부산 강서구 명지국제2로 41' },

  { id: 'ecodelta_hoban',         address: '부산 강서구 에코대로 243' },
  { id: 'ecodelta_sujain',        address: '부산 강서구 에코중앙1로 33' },
  { id: 'ecodelta_prugio_lin',    address: '부산 강서구 에코델타3로 43' },
  { id: 'ecodelta_xi',            address: '부산 강서구 에코델타1로 24' },
  { id: 'ecodelta_elife',         address: '부산 강서구 에코델타1로 42' },
  { id: 'ecodelta_prugio_center', address: '부산 강서구 에코델타1로 66' },
  { id: 'ecodelta_theberhill',    address: '부산 강서구 에코델타5로 60' },
  { id: 'ecodelta_jungheung',     address: '부산 강서구 강동동 4428-4' },
  { id: 'ecodelta_dietr_grand',   address: '부산 강서구 강동동 4277' },
  { id: 'ecodelta_dietr_first',   address: '부산 강서구 강동동 4677-2' },
];

const results = [];

for (const { id, address } of entries) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_KEY}`,
      KA: 'sdk/1.0 os/web origin/localhost',
    },
  });
  const json = await res.json();

  if (json.documents?.length > 0) {
    const { x, y } = json.documents[0];
    results.push({ id, lat: parseFloat(y), lng: parseFloat(x), address });
    process.stdout.write(`OK  ${id}: ${y}, ${x}\n`);
  } else {
    results.push({ id, lat: null, lng: null, address });
    process.stdout.write(`FAIL ${id}: 결과 없음\n`);
  }
}

console.log('\n=== JSON ===');
console.log(JSON.stringify(results, null, 2));
