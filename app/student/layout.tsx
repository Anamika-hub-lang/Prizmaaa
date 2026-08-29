import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Student space')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
