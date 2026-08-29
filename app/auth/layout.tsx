import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Authentication')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
