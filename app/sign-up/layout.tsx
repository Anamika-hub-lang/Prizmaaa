import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Sign up')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
