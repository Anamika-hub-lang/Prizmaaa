'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  // Do not wrap with RequireAuth — Clerk handshake lands here before session exists.
  return <>{children}</>
}
