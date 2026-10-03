import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { complexData, getComplexFullName } from "@/lib/vrData";
import { getComplexDescriptions } from "@/lib/complexDescriptionStore";
import { sanitizeDescriptionHtml, extractHeadings, splitAtFirstH2 } from "@/lib/sanitizeDescriptionHtml";
import FloorPlanView from "@/components/vr/FloorPlanView";
import ComplexDescriptionSection from "@/components/vr/ComplexDescriptionSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ComplexReviews from "@/components/vr/ComplexReviews";
import ReviewTeaser from "@/components/vr/ReviewTeaser";
import { listApprovedReviews } from "@/lib/reviewStore";
import { isReviewEnabled } from "@/lib/reviewUtils";

export const revalidate = 3600;

type Props = { params: { regionId: string; slug: string } };

function findComplex(regionId: string, slug: string) {
  return complexData.find((c) => c.regionId === regionId && c.slug === slug);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const complex = findComplex(params.regionId, params.slug);
  if (!complex) return {};

  const descriptions = await getComplexDescriptions();
  const raw = descriptions[complex.id];
  const fullName = getComplexFullName(complex);
  const summary = raw
    ? stripHtml(sanitizeDescriptionHtml(raw)).slice(0, 150)
    : `${fullName}(${complex.regionName}) VR 가상투어와 평형별 배치도 정보`;

  return {
    title: `${fullName} VR 가상투어·평면도 | ${complex.regionName} - AllView`,
    description: summary,
    alternates: { canonical: `/vr-tour/${complex.regionId}/${complex.slug}` },
  };
}

export default async function VRComplexPage({ params }: Props) {
  const { regionId, slug } = params;
  const complex = findComplex(regionId, slug);
  if (!complex) notFound();

  const descriptions = await getComplexDescriptions();
  const raw = descriptions[complex.id];
  const cleaned = raw ? sanitizeDescriptionHtml(raw) : undefined;
  const { html: withIds, toc } = cleaned ? extractHeadings(cleaned) : { html: undefined, toc: [] };
  const { intro, rest } = withIds ? splitAtFirstH2(withIds) : { intro: "", rest: "" };
  const reviewsEnabled = isReviewEnabled(complex.id);
  const reviews = reviewsEnabled ? await listApprovedReviews(complex.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FloorPlanView complex={complex} />
      {reviewsEnabled && <ReviewTeaser reviews={reviews} />}
      {withIds && (
        <ComplexDescriptionSection
          title={complex.name}
          intro={intro}
          body={rest}
          toc={toc}
          collapsible={stripHtml(rest).length > 500}
        />
      )}
      {reviewsEnabled && (
        <ComplexReviews complexId={complex.id} complexName={getComplexFullName(complex)} reviews={reviews} />
      )}
      <ScrollToTopButton />
    </div>
  );
}
