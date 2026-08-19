export const COUNSELLING_PRICE_INR = 199
export const INTERVIEW_PREP_PRICE_INR = 99
export const INTERVIEW_PREP_TOPIC_ID = 'interview-prep-mock'

export function counsellingPriceInr(categoryId: string): number {
  if (categoryId === INTERVIEW_PREP_TOPIC_ID) return INTERVIEW_PREP_PRICE_INR
  return COUNSELLING_PRICE_INR
}
