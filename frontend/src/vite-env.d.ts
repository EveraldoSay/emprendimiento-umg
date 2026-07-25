/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE: string
  readonly VITE_API_URL: string
  readonly VITE_BASE_PATH: string
  readonly VITE_USE_HASH_ROUTER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
