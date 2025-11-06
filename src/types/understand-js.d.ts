declare module "@understand/understand-js" {
  export interface UnderstandOptions {
    [key: string]: any;
  }

  export interface CatchErrorOptions {
    enableWindowError?: boolean;
    enableUnhandledRejection?: boolean;
    enableConsoleError?: boolean;
  }

  export interface PatchConsoleOptions {
    enableConsoleLog?: boolean;
    enableConsoleWarn?: boolean;
    enableConsoleInfo?: boolean;
    enableConsoleDebug?: boolean;
  }

  export interface Metadata {
    [key: string]: any;
  }

  export type SeverityLevel =
    | "fatal"
    | "error"
    | "warning"
    | "log"
    | "info"
    | "debug"
    | "critical";

  export interface Handler {
    handle(message: string, error?: Error, metadata?: Metadata): void;
    handleMessage(
      message: string,
      level: SeverityLevel,
      stack?: any[],
      metadata?: Metadata
    ): void;
    withoutFilters(callback: () => void): void;
    getContext(): Record<string, any>;
    close(): void;
  }

  export class Understand {
    options: UnderstandOptions;
    handler: Handler;

    init(options: UnderstandOptions): this;
    catchErrors(options?: CatchErrorOptions): void;
    patchConsoleLogs(options?: PatchConsoleOptions): void;
    logError(e: any, metadata?: Metadata): void;
    logMessage(
      message: string,
      level?: SeverityLevel,
      metadata?: Metadata
    ): void;
    withContext(callback: (context: Record<string, any>) => void): void;
    close(): void;
    checkInitialized(): boolean;
  }

  const understand: Understand;
  export default understand;
}
