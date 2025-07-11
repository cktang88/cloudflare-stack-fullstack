import type { Config } from './index';

export const developmentConfig: Partial<Config> = {
  environment: 'development',
  
  api: {
    baseUrl: 'http://localhost:8788',
    version: 'v1',
    timeout: 30000,
  },
  
  database: {
    name: 'todo-db',
  },
  
  features: {
    enableAuth: false,
    enableApiDocs: true,
    enableRateLimiting: false,
  },
  
  logging: {
    level: 'debug',
  },
};