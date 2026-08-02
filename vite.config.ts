import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devApiPlugin } from './vite/plugins/devApi.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiPlugin({
        clerkSecretKey: env.CLERK_SECRET_KEY,
        supabaseUrl: env.VITE_SUPABASE_URL,
        supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
        clerkWebhookSecret: env.CLERK_WEBHOOK_SECRET,
        notifyEmail: env.NOTIFY_EMAIL,
        resendApiKey: env.RESEND_API_KEY,
        cashfreeClientId: env.CASHFREE_CLIENT_ID,
        cashfreeClientSecret: env.CASHFREE_CLIENT_SECRET,
        cashfreeMode: env.CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
        publicAppUrl: env.PUBLIC_APP_URL,
      }),
    ],
  }
})
