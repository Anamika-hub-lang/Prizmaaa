import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.reviews

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
