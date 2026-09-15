/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIDTRANS_ENV?: string;
  readonly VITE_MIDTRANS_MERCHANT_ID?: string;
  readonly VITE_MIDTRANS_CLIENT_KEY?: string;
  readonly MIDTRANS_SERVER_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
