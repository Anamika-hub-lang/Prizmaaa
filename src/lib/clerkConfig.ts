export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

export const isClerkConfigured = Boolean(clerkPublishableKey)

export const clerkAppearance = {
  variables: {
    colorPrimary: '#f37021',
    colorText: '#1a1a1a',
    fontFamily: 'Poppins, system-ui, sans-serif',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'shadow-none border-0 bg-transparent',
    headerTitle: 'text-xl font-bold text-[#1d1d1d]',
    headerSubtitle: 'text-sm text-gray-500',
    formButtonPrimary:
      'bg-educture-orange hover:bg-educture-orange-dark text-sm font-semibold normal-case',
    footerActionLink: 'text-educture-orange font-semibold',
    formFieldInput: 'rounded-xl border border-gray-200 focus:border-educture-orange',
  },
}
