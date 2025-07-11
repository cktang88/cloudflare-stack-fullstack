import { Context, Next } from 'hono';
import { getCloudflareEnv, type Config } from '@shared/config';

// Extend the Hono context to include config
declare module 'hono' {
  interface ContextVariableMap {
    config: Config;
  }
}

export async function configMiddleware(c: Context, next: Next) {
  // Load configuration from Cloudflare environment
  const config = getCloudflareEnv(c.env);
  
  // Store config in context for use in routes
  c.set('config', config);
  
  await next();
}