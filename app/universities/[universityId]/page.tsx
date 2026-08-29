import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UniversityDetailPage } from '@/views/UniversityDetailPage'
import { universities, universityById } from '@/data/universities'
import { universityStorySeo } from '@/lib/seo'

type Props = { params: Promise<{ universityId: string }> }

export function generateStaticParams() {
  return universities.map((university) => ({ universityId: university.id }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universityId } = await params
  const university = universityById(universityId)
  if (!university) notFound()
  return universityStorySeo(university)
}

export default async function Page({ params }: Props) {
  const { universityId } = await params
  if (!universityById(universityId)) notFound()
  return <UniversityDetailPage />
}
