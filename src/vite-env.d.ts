/// <reference types="vite/client" />

/**
 * Typed Vite env vars.
 *
 * The project's tsconfig pins `"types": ["node"]`, which leaves `import.meta.env`
 * untyped and produces TS2339 ("Property 'env' does not exist on type 'ImportMeta'").
 * Declaring the env shape here fixes that for every caller without touching runtime
 * behaviour — Vite still inlines the real values at build time.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Supabase identity used behind the passcode screen (not a secret). */
  readonly VITE_STREAKLY_EMAIL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
