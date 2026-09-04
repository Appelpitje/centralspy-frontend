/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_MASTERSERVER_HOST?: string;
  readonly VITE_MASTERSERVER_IP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
