import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.about

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
