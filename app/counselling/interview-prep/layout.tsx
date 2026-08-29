import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.interviewPrep

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
