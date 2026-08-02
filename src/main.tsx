import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { MentorContentProvider } from './context/MentorContentContext'
import { UserProfileSync } from './components/auth/UserProfileSync'
import { ConfigErrorScreen } from './components/auth/ConfigErrorScreen'
import { clerkPublishableKey, isClerkConfigured } from './lib/clerkConfig'

const root = document.getElementById('root')!

if (!isClerkConfigured) {
  createRoot(root).render(
    <StrictMode>
      <ConfigErrorScreen
        message="Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your .env file (see .env.example)."
      />
    </StrictMode>,
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey!} afterSignOutUrl="/">
        <UserProfileSync />
        <MentorContentProvider>
          <App />
        </MentorContentProvider>
      </ClerkProvider>
    </StrictMode>,
  )
}
