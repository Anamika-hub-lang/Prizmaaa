import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Payment return')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
