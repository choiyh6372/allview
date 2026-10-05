"use client";

import { useState } from "react";
import PriceChart from "@/components/real-estate/PriceChart";
import type { Complex } from "@/lib/realEstateData";
import type { RentRawItem } from "@/lib/molitApi";
import type { AreaTypeMap } from "@/lib/parseAptMapping";

// 단지별 실거래가 페이지의 가격 그래프 (면적 선택 상태만 관리)
export default function ComplexPriceChart({
  complex,
  rentItems,
  areaTypeMap,
  tradeName,
}: {
  complex: Complex;
  rentItems: RentRawItem[];
  /** 면적 버튼에 타입(A·B·C) 표시용 — 이 단지 것만 */
  areaTypeMap: AreaTypeMap;
  /** areaTypeMap 조회용 실거래 신고명 */
  tradeName: string;
}) {
  const [selectedArea, setSelectedArea] = useState("");
  return (
    <PriceChart
      complex={complex}
      rentItems={rentItems}
      selectedArea={selectedArea}
      onAreaChange={setSelectedArea}
      areaTypeMap={areaTypeMap}
      nameForAreaType={tradeName}
      hideVrButton
      light
    />
  );
}
