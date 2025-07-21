/**
 * Logger
 * 
 * A comprehensive logging system for the application.
 */

import { Platform } from 'react-native';

/**
 * Log levels
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  NONE = 6,
}

/**
 * Log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  error?: Error;
}

/**
 * Log transport interface
 */
export interface LogTransport {
  log(entry: LogEntry): void;
}

/**
 * Console log transport
 */
export class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const { timestamp, level, tag, message, data, error } = entry;
    
    const prefix = `[${timestamp}] [${LogLevel[level]}] [${tag}]`;
    
    switch (level) {
      case LogLevel.TRACE:
        console.trace(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${message}`, error || data || '');
        break;
    }
  }
}

/**
 * File log transport
 */
export class FileTransport implements LogTransport {
  private filePath: string;
  private maxFileSize: number;
  private queue: LogEntry[] = [];
  private isWriting = false;
  
  constructor(filePath: string, maxFileSize: number = 5 * 1024 * 1024) {
    this.filePath = filePath;
    this.maxFileSize = maxFileSize;
  }
  
  log(entry: LogEntry): void {
    // Add entry to queue
    this.queue.push(entry);
    
    // Process queue if not already writing
    if (!this.isWriting) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isWriting = false;
      return;
    }
    
    this.isWriting = true;
    
    try {
      // In a real implementation, we would write to a file
      // For this example, we'll just simulate writing
      const entry = this.queue.shift();
      
      // Simulate file write
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Process next entry
      this.processQueue();
    } catch (error) {
      console.error('Failed to write log to file', error);
      this.isWriting = false;
    }
  }
}

/**
 * Remote log transport
 */
export class RemoteTransport implements LogTransport {
  private endpoint: string;
  private apiKey: string;
  private queue: LogEntry[] = [];
  private isSending = false;
  private batchSize: number;
  private batchInterval: number;
  private timer: NodeJS.Timeout | null = null;
  
  constructor(
    endpoint: string,
    apiKey: string,
    batchSize: number = 10,
    batchInterval: number = 5000
  ) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.batchSize = batchSize;
    this.batchInterval = batchInterval;
    
    // Start batch timer
    this.startBatchTimer();
  }
  
  log(entry: LogEntry): void {
    // Add entry to queue
    this.queue.push(entry);
    
    // Send batch if queue size reaches batch size
    if (this.queue.length >= this.batchSize) {
      this.sendBatch();
    }
  }
  
  private startBatchTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.sendBatch();
      }
    }, this.batchInterval);
  }
  
  private async sendBatch(): Promise<void> {
    if (this.isSending || this.queue.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // Get batch of logs
      const batch = this.queue.splice(0, this.batchSize);
      
      // In a real implementation, we would send logs to a remote server
      // For this example, we'll just simulate sending
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.isSending = false;
      
      // Send next batch if queue is not empty
      if (this.queue.length > 0) {
        this.sendBatch();
      }
    } catch (error) {
      console.error('Failed to send logs to remote server', error);
      
      // Put logs back in queue
      this.queue.unshift(...this.queue.splice(0, this.batchSize));
      
      this.isSending = false;
    }
  }
  
  dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // Send any remaining logs
    if (this.queue.length > 0) {
      this.sendBatch();
    }
  }
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  transports: LogTransport[];
  includeTimestamp?: boolean;
  includeAppVersion?: boolean;
  includeDeviceInfo?: boolean;
  redactSensitiveData?: boolean;
  sensitiveKeys?: string[];
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  transports: [new ConsoleTransport()],
  includeTimestamp: true,
  includeAppVersion: true,
  includeDeviceInfo: true,
  redactSensitiveData: true,
  sensitiveKeys: ['password', 'token', 'secret', 'key', 'auth', 'credentials'],
};

/**
 * Logger class
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private appVersion: string = '1.0.0';
  private deviceInfo: string = `${Platform.OS} ${Platform.Version}`;
  
  private constructor(config: LoggerConfig = defaultConfig) {
    this.config = config;
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }
  
  /**
   * Configure the logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Set the app version
   */
  public setAppVersion(version: string): void {
    this.appVersion = version;
  }
  
  /**
   * Set the device info
   */
  public setDeviceInfo(info: string): void {
    this.deviceInfo = info;
  }
  
  /**
   * Log a message at the specified level
   */
  private log(
    level: LogLevel,
    tag: string,
    message: string,
    dataOrError?: any,
    error?: Error
  ): void {
    // Check if level is enabled
    if (level < this.config.minLevel) {
      return;
    }
    
    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      tag,
      message,
    };
    
    // Add data or error
    if (error) {
      entry.error = error;
      
      if (dataOrError) {
        entry.data = this.redactSensitiveData(dataOrError);
      }
    } else if (dataOrError) {
      if (dataOrError instanceof Error) {
        entry.error = dataOrError;
      } else {
        entry.data = this.redactSensitiveData(dataOrError);
      }
    }
    
    // Add app version
    if (this.config.includeAppVersion) {
      entry.data = {
        ...entry.data,
        appVersion: this.appVersion,
      };
    }
    
    // Add device info
    if (this.config.includeDeviceInfo) {
      entry.data = {
        ...entry.data,
        deviceInfo: this.deviceInfo,
      };
    }
    
    // Log to all transports
    for (const transport of this.config.transports) {
      transport.log(entry);
    }
  }
  
  /**
   * Redact sensitive data
   */
  private redactSensitiveData(data: any): any {
    if (!this.config.redactSensitiveData || !data) {
      return data;
    }
    
    // If data is not an object, return as is
    if (typeof data !== 'object') {
      return data;
    }
    
    // Clone data to avoid modifying original
    const clonedData = Array.isArray(data) ? [...data] : { ...data };
    
    // Redact sensitive keys
    for (const key in clonedData) {
      if (
        this.config.sensitiveKeys?.some(
          sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )
      ) {
        clonedData[key] = '[REDACTED]';
      } else if (typeof clonedData[key] === 'object' && clonedData[key] !== null) {
        clonedData[key] = this.redactSensitiveData(clonedData[key]);
      }
    }
    
    return clonedData;
  }
  
  /**
   * Log a trace message
   */
  public trace(tag: string, message: string, data?: any): void {
    this.log(LogLevel.TRACE, tag, message, data);
  }
  
  /**
   * Log a debug message
   */
  public debug(tag: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, tag, message, data);
  }
  
  /**
   * Log an info message
   */
  public info(tag: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, tag, message, data);
  }
  
  /**
   * Log a warning message
   */
  public warn(tag: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, tag, message, data);
  }
  
  /**
   * Log an error message
   */
  public error(tag: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, tag, message, data, error);
  }
  
  /**
   * Log a fatal message
   */
  public fatal(tag: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, tag, message, data, error);
  }
  
  /**
   * Create a tagged logger
   */
  public createTaggedLogger(tag: string): TaggedLogger {
    return new TaggedLogger(this, tag);
  }
}

/**
 * Tagged logger
 */
export class TaggedLogger {
  private logger: Logger;
  private tag: string;
  
  constructor(logger: Logger, tag: string) {
    this.logger = logger;
    this.tag = tag;
  }
  
  /**
   * Log a trace message
   */
  public trace(message: string, data?: any): void {
    this.logger.trace(this.tag, message, data);
  }
  
  /**
   * Log a debug message
   */
  public debug(message: string, data?: any): void {
    this.logger.debug(this.tag, message, data);
  }
  
  /**
   * Log an info message
   */
  public info(message: string, data?: any): void {
    this.logger.info(this.tag, message, data);
  }
  
  /**
   * Log a warning message
   */
  public warn(message: string, data?: any): void {
    this.logger.warn(this.tag, message, data);
  }
  
  /**
   * Log an error message
   */
  public error(message: string, error?: Error, data?: any): void {
    this.logger.error(this.tag, message, error, data);
  }
  
  /**
   * Log a fatal message
   */
  public fatal(message: string, error?: Error, data?: any): void {
    this.logger.fatal(this.tag, message, error, data);
  }
}

/**
 * Get the global logger instance
 */
export const getLogger = (config?: LoggerConfig): Logger => {
  return Logger.getInstance(config);
};

/**
 * Create a tagged logger
 */
export const createTaggedLogger = (tag: string): TaggedLogger => {
  return Logger.getInstance().createTaggedLogger(tag);
};