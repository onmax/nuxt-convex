export { api } from '../../convex/_generated/api'

// `npx convex dev` writes VITE_CONVEX_URL to .env.local, which Vite loads
export const convexUrl: string = import.meta.env.VITE_CONVEX_URL ?? ''
