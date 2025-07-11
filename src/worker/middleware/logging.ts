import { Context, Next } from 'hono';
import { createLogger, generateRequestId } from '@shared/utils';

export async function loggingMiddleware(c: Context, next: Next) {
  const config = c.get('config');
  const logger = createLogger('api', config.logging.level);
  
  // Generate request ID
  const requestId = c.req.header('x-request-id') || generateRequestId();
  c.header('x-request-id', requestId);
  
  // Log request
  const start = Date.now();
  logger.info('Request received', {
    method: c.req.method,
    path: c.req.path,
    requestId,
    userAgent: c.req.header('user-agent'),
  });
  
  try {
    await next();
    
    // Log response
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: c.req.method,
      path: c.req.path,
      requestId,
      status: c.res.status,
      duration: `${duration}ms`,
    });
  } catch (error) {
    // Log error
    const duration = Date.now() - start;
    logger.error('Request failed', error, {
      method: c.req.method,
      path: c.req.path,
      requestId,
      duration: `${duration}ms`,
    });
    throw error;
  }
}