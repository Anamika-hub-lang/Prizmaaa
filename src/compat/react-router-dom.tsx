'use client'

import NextLink from 'next/link'
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'
import {
  createContext,
  useCallback,
  //random- 
  useContext,
  useEffect,
  useMemo,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react'

type To =
  | string
  | {
      pathname?: string
      search?: string
      hash?: string
    }

function toHref(to: To): string {
  if (typeof to === 'string') return to
  const pathname = to.pathname ?? ''
  const search = to.search
    ? to.search.startsWith('?')
      ? to.search
      : `?${to.search}`
    : ''
  const hash = to.hash ? (to.hash.startsWith('#') ? to.hash : `#${to.hash}`) : ''
  return `${pathname}${search}${hash}`
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  to: To
  /** Ignored — react-router location state is not supported. */
  state?: unknown
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function Link({ to, state: _state, replace, children, ...rest }: LinkProps) {
  return (
    <NextLink href={toHref(to)} replace={replace} {...rest}>
      {children}
    </NextLink>
  )
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [router, to, replace])

  return null
}

export function useNavigate() {
  const router = useRouter()

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to < 0) router.back()
        else if (to > 0) router.forward()
        return
      }
      if (options?.replace) router.replace(to)
      else router.push(to)
    },
    [router],
  )
}

export function useParams(): Record<string, string> {
  const params = useNextParams()
  const result: Record<string, string> = {}
  if (!params) return result

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) result[key] = value[0] ?? ''
    else if (value != null) result[key] = value
  }
  return result
}

export function usePathname(): string {
  return useNextPathname()
}

export function useLocation() {
  const pathname = useNextPathname() ?? ''
  const nextSearchParams = useNextSearchParams()
  const query = nextSearchParams?.toString() ?? ''

  return {
    pathname,
    search: query ? `?${query}` : '',
    hash: '',
    state: null as null,
  }
}

type SearchParamsInit =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | string[] | undefined>)

function toURLSearchParams(
  init: URLSearchParams | Record<string, string | string[] | undefined>,
): URLSearchParams {
  if (init instanceof URLSearchParams) return new URLSearchParams(init)

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(init)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
    } else {
      params.set(key, value)
    }
  }
  return params
}

export function useSearchParams(): [
  URLSearchParams,
  (nextInit: SearchParamsInit, navigateOpts?: { replace?: boolean }) => void,
] {
  const router = useRouter()
  const pathname = useNextPathname() ?? ''
  const nextSearchParams = useNextSearchParams()

  const searchParams = useMemo(
    () => new URLSearchParams(nextSearchParams?.toString() ?? ''),
    [nextSearchParams],
  )

  const setSearchParams = useCallback(
    (nextInit: SearchParamsInit, _navigateOpts?: { replace?: boolean }) => {
      const prev = new URLSearchParams(nextSearchParams?.toString() ?? '')
      const resolved = typeof nextInit === 'function' ? nextInit(prev) : nextInit
      const params = toURLSearchParams(resolved)
      const qs = params.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      router.replace(href)
    },
    [router, pathname, nextSearchParams],
  )

  return [searchParams, setSearchParams]
}

export const RouterOutletContext = createContext<ReactNode>(null)

export function RouterOutletProvider({ children }: { children: ReactNode }) {
  return (
    <RouterOutletContext.Provider value={children}>{children}</RouterOutletContext.Provider>
  )
}

export function Outlet() {
  const children = useContext(RouterOutletContext)
  return <>{children}</>
}
