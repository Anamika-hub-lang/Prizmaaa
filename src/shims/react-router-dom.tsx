'use client'

import NextLink from 'next/link'
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from 'react'

type To = string | { pathname?: string; search?: string; hash?: string }

function toHref(to: To): string {
  if (typeof to === 'string') return to
  const path = to.pathname ?? ''
  const search = to.search ? (to.search.startsWith('?') ? to.search : `?${to.search}`) : ''
  const hash = to.hash ? (to.hash.startsWith('#') ? to.hash : `#${to.hash}`) : ''
  return `${path}${search}${hash}`
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  to: To
  replace?: boolean
  state?: unknown
}

export function Link({ to, replace, state: _state, children, ...rest }: LinkProps) {
  return (
    <NextLink href={toHref(to)} replace={replace} {...rest}>
      {children}
    </NextLink>
  )
}

export function NavLink({
  className,
  ...rest
}: Omit<LinkProps, 'className'> & {
  className?: string | ((args: { isActive: boolean }) => string)
}) {
  const pathname = usePathname()
  const href = toHref(rest.to)
  const isActive = pathname === href || pathname.startsWith(`${href}/`)
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className
  return (
    <Link {...rest} className={resolvedClassName}>
      {rest.children}
    </Link>
  )
}

export function Navigate({
  to,
  replace = false,
}: {
  to: To
  replace?: boolean
  state?: unknown
}) {
  const router = useRouter()
  const href = toHref(to)

  useEffect(() => {
    if (replace) router.replace(href)
    else router.push(href)
  }, [href, replace, router])

  return null
}

export function useNavigate() {
  const router = useRouter()
  return (to: To | number, options?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === 'number') {
      if (to < 0) router.back()
      else router.forward()
      return
    }
    const href = toHref(to)
    if (options?.replace) router.replace(href)
    else router.push(href)
  }
}

export function useLocation() {
  const pathname = usePathname()
  const searchParams = useNextSearchParams()
  const search = searchParams.toString()
  return useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : '',
      hash: '',
      state: null as unknown,
      key: 'default',
    }),
    [pathname, search],
  )
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  const params = useNextParams()
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(params)) {
    out[key] = Array.isArray(value) ? value[0] : value
  }
  return out as T
}

export function useSearchParams() {
  const searchParams = useNextSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const setSearchParams = (
    nextInit: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams | Record<string, string>),
    opts?: { replace?: boolean },
  ) => {
    const current = new URLSearchParams(searchParams.toString())
    const resolved = typeof nextInit === 'function' ? nextInit(current) : nextInit
    const next =
      resolved instanceof URLSearchParams
        ? resolved
        : new URLSearchParams(resolved as Record<string, string>)
    const qs = next.toString()
    const href = qs ? `${pathname}?${qs}` : pathname
    if (opts?.replace) router.replace(href)
    else router.push(href)
  }

  return [searchParams, setSearchParams] as const
}

const OutletContext = createContext<ReactNode>(null)

export function Outlet() {
  return <>{useContext(OutletContext)}</>
}

export function OutletProvider({ children, outlet }: { children: ReactNode; outlet: ReactNode }) {
  return <OutletContext.Provider value={outlet}>{children}</OutletContext.Provider>
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Route(_props: { path?: string; element?: ReactNode; children?: ReactNode }) {
  return null
}
