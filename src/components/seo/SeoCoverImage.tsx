import Image from 'next/image'

const OPTIMIZED_HOSTS = new Set(['images.unsplash.com'])

type Props = {
  src: string
  alt: string
  className?: string
  sizes: string
  priority?: boolean
}

export function SeoCoverImage({ src, alt, className, sizes, priority = false }: Props) {
  let host = ''
  try {
    host = new URL(src).hostname
  } catch {
    host = ''
  }

  if (src.startsWith('https://') && OPTIMIZED_HOSTS.has(host)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    )
  }

  return <img src={src} alt={alt} className={className} />
}
