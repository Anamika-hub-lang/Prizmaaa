import { useEffect, useState } from 'react'
import { DEFAULT_UNIVERSITY_IMAGE } from '../../data/universityImages'

type Props = {
  src: string
  alt?: string
  className?: string
}

export function UniversityImage({ src, alt = '', className }: Props) {
  const [url, setUrl] = useState(src)

  useEffect(() => {
    setUrl(src)
  }, [src])

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (url !== DEFAULT_UNIVERSITY_IMAGE) setUrl(DEFAULT_UNIVERSITY_IMAGE)
      }}
    />
  )
}
