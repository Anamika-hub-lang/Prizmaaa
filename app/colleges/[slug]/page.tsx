import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollegeDetailPage } from '@/views/CollegeDetailPage'
import { collegeRepository } from '@/lib/colleges'
import { collegeDetailSeo } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const colleges = await collegeRepository.getAll()
  return colleges.map((college) => ({ slug: college.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const college = await collegeRepository.getBySlug(slug)
  if (!college) notFound()
  return collegeDetailSeo(college)
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const college = await collegeRepository.getBySlug(slug)
  if (!college) notFound()
  return <CollegeDetailPage initialCollege={college} />
}
