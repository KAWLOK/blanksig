/**
 * Logging Utility for BlankSig
 *
 * Provides structured logging with different levels.
 * In production, errors are captured but not exposed to console.
 * In development, full logging is available.
 *
 * SECURITY: Never log wallet addresses or sensitive data.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  error?: Error
  metadata?: Record<string, unknown>
  timestamp: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Create a log entry object
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  error?: Error,
  metadata?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    error,
    metadata,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Output log entry
 * In development: console output
 * In production: structured JSON (ready for log aggregation)
 */
function outputLog(entry: LogEntry): void {
  if (isDevelopment) {
    const prefix = `[${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ''}`

    switch (entry.level) {
      case 'error':
        if (entry.error) {
          console.error(prefix, entry.message, entry.error)
        } else {
          console.error(prefix, entry.message, entry.metadata || '')
        }
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.metadata || '')
        break
      case 'info':
        console.info(prefix, entry.message, entry.metadata || '')
        break
      case 'debug':
        console.debug(prefix, entry.message, entry.metadata || '')
        break
    }
  } else {
    // In production, output structured JSON for log aggregation
    // This can be captured by services like Vercel Logs, Datadog, etc.
    const sanitizedEntry = {
      ...entry,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            // Don't include stack traces in production logs
          }
        : undefined,
    }

    // Only output errors and warnings in production
    if (entry.level === 'error' || entry.level === 'warn') {
      console.log(JSON.stringify(sanitizedEntry))
    }
  }
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug-level logging (development only)
   */
  debug(message: string, metadata?: Record<string, unknown>, context?: string): void {
    if (isDevelopment) {
      outputLog(createLogEntry('debug', message, context, undefined, metadata))
    }
  },

  /**
   * Info-level logging
   */
  info(message: string, metadata?: Record<string, unknown>, context?: string): void {
    outputLog(createLogEntry('info', message, context, undefined, metadata))
  },

  /**
   * Warning-level logging
   */
  warn(message: string, metadata?: Record<string, unknown>, context?: string): void {
    outputLog(createLogEntry('warn', message, context, undefined, metadata))
  },

  /**
   * Error-level logging
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const errorObj = error instanceof Error ? error : undefined
    const metadata = error && !(error instanceof Error) ? { details: error } : undefined
    outputLog(createLogEntry('error', message, context, errorObj, metadata))
  },

  /**
   * Create a child logger with a specific context
   */
  child(context: string) {
    return {
      debug: (message: string, metadata?: Record<string, unknown>) =>
        logger.debug(message, metadata, context),
      info: (message: string, metadata?: Record<string, unknown>) =>
        logger.info(message, metadata, context),
      warn: (message: string, metadata?: Record<string, unknown>) =>
        logger.warn(message, metadata, context),
      error: (message: string, error?: Error | unknown) =>
        logger.error(message, error, context),
    }
  },
}

// Pre-configured loggers for common contexts
export const ethosLogger = logger.child('ethos')
export const dbLogger = logger.child('db')
export const apiLogger = logger.child('api')
export const moderationLogger = logger.child('moderation')
