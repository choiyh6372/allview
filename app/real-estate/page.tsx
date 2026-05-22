import { fetchAptTradeData, fetchSilvTradeData, fetchAptRentData } from "@/lib/molitApi";
import { buildComplexList } from "@/lib/aptTradeApi";
import RealEstateClient from "@/components/real-estate/RealEstateClient";

export const dynamic = "force-dynamic";

export default async function RealEstatePage() {
  const [aptItems, silvItems, rentItems] = await Promise.all([
    fetchAptTradeData("26440", 60),
    fetchSilvTradeData("26440", 60),
    fetchAptRentData("26440", 60),
  ]);

  const aptComplexes = buildComplexList(aptItems);
  const silvComplexes = buildComplexList(
    silvItems.filter((i) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );

  return (
    <RealEstateClient
      aptComplexes={aptComplexes}
      silvComplexes={silvComplexes}
      rentItems={rentItems}
    />
  );
}
