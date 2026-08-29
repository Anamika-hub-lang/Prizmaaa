import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.colleges

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
