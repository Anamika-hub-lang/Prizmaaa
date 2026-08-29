import { redirect } from 'next/navigation'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata()

export default function Page() {
  redirect('/colleges')
}

