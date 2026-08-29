import { permanentRedirect } from 'next/navigation'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Compare colleges', '/colleges')

export default function Page() {
  permanentRedirect('/colleges')
}
