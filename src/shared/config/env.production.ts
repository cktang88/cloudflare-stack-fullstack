import type { Config } from './index';

export const productionConfig: Partial<Config> = {
  environment: 'production',
  
  api: {
    version: 'v1',
    timeout: 30000,
  },
  
  features: {
    enableAuth: true,
    enableApiDocs: false,
    enableRateLimiting: true,
  },
  
  logging: {
    level: 'error',
  },
  
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
};