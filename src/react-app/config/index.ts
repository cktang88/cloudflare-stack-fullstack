// Frontend configuration
interface FrontendConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableAuth: boolean;
    enableApiDocs: boolean;
  };
  app: {
    name: string;
    version: string;
  };
}

// Get configuration based on environment
export function getConfig(): FrontendConfig {
  return {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
    },
    features: {
      enableAuth: import.meta.env.VITE_ENABLE_AUTH === 'true',
      enableApiDocs: import.meta.env.VITE_ENABLE_API_DOCS !== 'false',
    },
    app: {
      name: import.meta.env.VITE_APP_NAME || 'Todo App',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    },
  };
}

export const config = getConfig();