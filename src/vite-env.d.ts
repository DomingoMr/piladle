/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_SONGS: string;
  // Add more VITE_ vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
