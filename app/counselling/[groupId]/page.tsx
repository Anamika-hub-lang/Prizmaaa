import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CounsellingCategoryPage } from '@/views/CounsellingCategoryPage'
import { counsellingGroupById, counsellingGroups } from '@/data/counsellingServices'
import { counsellingGroupSeo } from '@/lib/seo'

type Props = { params: Promise<{ groupId: string }> }

export function generateStaticParams() {
  return counsellingGroups.map((group) => ({ groupId: group.id }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params
  const seo = counsellingGroupSeo(groupId)
  if (!seo) notFound()
  return seo
}

export default async function Page({ params }: Props) {
  const { groupId } = await params
  if (!counsellingGroupById(groupId)) notFound()
  return <CounsellingCategoryPage />
}
