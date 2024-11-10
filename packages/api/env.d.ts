declare global {
  namespace NodeJS {
    interface ProcessEnv {
      UNSPLASH_ACCESS_KEY: string
      ALLOW_ORIGIN: string
      PUBLIC_CACHE_TTL: string
    }
  }
}

export {}
