import { z } from 'zod';

// Environment enum
export const Environment = {
  Development: 'development',
  Test: 'test',
  Staging: 'staging',
  Production: 'production',
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

// Configuration schema
const configSchema = z.object({
  // Application
  environment: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  appName: z.string().default('Todo App'),
  appVersion: z.string().default('1.0.0'),
  
  // API
  api: z.object({
    baseUrl: z.string().url().optional(),
    version: z.string().default('v1'),
    timeout: z.number().positive().default(30000), // 30 seconds
  }),
  
  // Database
  database: z.object({
    name: z.string(),
    id: z.string().optional(), // For Cloudflare D1
  }),
  
  // Authentication
  auth: z.object({
    enabled: z.boolean().default(false),
    jwtSecret: z.string().optional(),
    jwtExpiresIn: z.string().default('7d'),
    refreshTokenExpiresIn: z.string().default('30d'),
  }),
  
  // Rate Limiting
  rateLimit: z.object({
    enabled: z.boolean().default(false),
    windowMs: z.number().positive().default(15 * 60 * 1000), // 15 minutes
    maxRequests: z.number().positive().default(100),
  }),
  
  // Features
  features: z.object({
    enableAuth: z.boolean().default(false),
    enableApiDocs: z.boolean().default(true),
    enableRateLimiting: z.boolean().default(false),
  }),
  
  // Logging
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    sentryDsn: z.string().optional(),
  }),
});

export type Config = z.infer<typeof configSchema>;

// Configuration loader class
export class ConfigLoader {
  private static instance: Config | null = null;
  
  static load(env: Record<string, any> = {}): Config {
    if (this.instance) {
      return this.instance;
    }
    
    const rawConfig = {
      environment: env.NODE_ENV || 'development',
      appName: env.APP_NAME,
      appVersion: env.APP_VERSION,
      
      api: {
        baseUrl: env.API_BASE_URL,
        version: env.API_VERSION,
        timeout: env.API_TIMEOUT ? parseInt(env.API_TIMEOUT, 10) : undefined,
      },
      
      database: {
        name: env.DATABASE_NAME || 'todo-db',
        id: env.DATABASE_ID,
      },
      
      auth: {
        enabled: env.ENABLE_AUTH === 'true',
        jwtSecret: env.JWT_SECRET,
        jwtExpiresIn: env.JWT_EXPIRES_IN,
        refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      },
      
      rateLimit: {
        enabled: env.ENABLE_RATE_LIMITING === 'true',
        windowMs: env.RATE_LIMIT_WINDOW_MS ? parseInt(env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS ? parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10) : undefined,
      },
      
      features: {
        enableAuth: env.ENABLE_AUTH === 'true',
        enableApiDocs: env.ENABLE_API_DOCS !== 'false',
        enableRateLimiting: env.ENABLE_RATE_LIMITING === 'true',
      },
      
      logging: {
        level: env.LOG_LEVEL,
        sentryDsn: env.SENTRY_DSN,
      },
    };
    
    const result = configSchema.safeParse(rawConfig);
    
    if (!result.success) {
      throw new Error(`Invalid configuration: ${result.error.message}`);
    }
    
    this.instance = result.data;
    return this.instance;
  }
  
  static get(): Config {
    if (!this.instance) {
      throw new Error('Configuration not loaded. Call ConfigLoader.load() first.');
    }
    return this.instance;
  }
  
  static reset(): void {
    this.instance = null;
  }
}

// Helper function to get config
export function getConfig(): Config {
  return ConfigLoader.get();
}

// Helper function to check environment
export function isProduction(): boolean {
  return getConfig().environment === Environment.Production;
}

export function isDevelopment(): boolean {
  return getConfig().environment === Environment.Development;
}

export function isTest(): boolean {
  return getConfig().environment === Environment.Test;
}

// Export validated environment variables for specific platforms
export function getCloudflareEnv(env: any): Config {
  return ConfigLoader.load({
    NODE_ENV: env.NODE_ENV || 'production',
    APP_NAME: env.APP_NAME,
    APP_VERSION: env.APP_VERSION,
    DATABASE_NAME: env.DATABASE_NAME,
    DATABASE_ID: env.DATABASE_ID,
    // Add other Cloudflare-specific env mappings
    ENABLE_AUTH: env.ENABLE_AUTH,
    ENABLE_API_DOCS: env.ENABLE_API_DOCS,
    ENABLE_RATE_LIMITING: env.ENABLE_RATE_LIMITING,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
    RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS,
    LOG_LEVEL: env.LOG_LEVEL,
    SENTRY_DSN: env.SENTRY_DSN,
  });
}