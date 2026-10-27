export type PricingConfig = {
  priceResearch: number;
  priceSummary: number;
  pricePptPer5Slides: number;
};

export type OrderSelection = {
  wantWord: boolean;
  wordStyle?: string | null;
  wantPpt: boolean;
  pptSlides: number;
  wantSummary: boolean;
};

export const WORD_STYLE_OPTIONS = ["فهرس", "فصول", "مباحث", "غير ذلك"] as const;

export function calculateTotalPrice(
  selection: OrderSelection,
  pricing: PricingConfig
): number {
  let total = 0;

  if (selection.wantWord) {
    total += pricing.priceResearch;
  }

  if (selection.wantPpt && selection.pptSlides > 0) {
    const bundles = Math.ceil(selection.pptSlides / 5);
    total += bundles * pricing.pricePptPer5Slides;
  }

  if (selection.wantSummary) {
    total += pricing.priceSummary;
  }

  return total;
}
