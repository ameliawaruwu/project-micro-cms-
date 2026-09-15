// Type definitions for Supabase Edge Functions (Deno runtime)
// This file resolves IDE TypeScript errors for 'Deno' and URL imports (https://...)

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }
  export const env: Env;
}

declare module 'https://*' {
  const content: any;
  export default content;
  export const serve: any;
  export const createClient: any;
}

declare module 'http://*' {
  const content: any;
  export default content;
}
