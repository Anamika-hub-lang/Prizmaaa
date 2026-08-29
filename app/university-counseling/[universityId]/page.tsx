import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UniversityCounselingDetailPage } from '@/views/UniversityCounselingDetailPage'
import {
  counselingUniversityById,
  featuredUniversities,
} from '@/components/marketing/university-counseling/data'
import { universityCounselingSeo } from '@/lib/seo'

type Props = { params: Promise<{ universityId: string }> }

export function generateStaticParams() {
  return featuredUniversities.map((university) => ({ universityId: university.id }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universityId } = await params
  const university = counselingUniversityById(universityId)
  if (!university) notFound()
  return universityCounselingSeo(university)
}

export default async function Page({ params }: Props) {
  const { universityId } = await params
  if (!counselingUniversityById(universityId)) notFound()
  return <UniversityCounselingDetailPage />
}
