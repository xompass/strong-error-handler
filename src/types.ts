export interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  query?: Record<string, unknown>;
  socket?: {
    destroy?: () => void;
  };
  url?: string;
}

export interface ResponseLike {
  headersSent?: boolean;
  statusCode: number;
  end: (content?: string, encoding?: BufferEncoding) => void;
  setHeader: (name: string, value: string) => void;
}

export type ErrorHandlerNext = (error?: unknown) => void;

export interface ErrorResponseData {
  [key: string]: unknown;
  code?: string;
  details?: unknown;
  message?: string;
  name?: string;
  stack?: string;
  statusCode: number;
}

export interface ErrorWriterOptions {
  debug?: boolean;
  defaultType?: string;
  negotiateContentType?: boolean;
  rootProperty?: string | false;
  safeFields?: string | string[];
}

export interface ErrorHandlerOptions extends ErrorWriterOptions {
  log?: boolean;
}

export type StrongErrorHandler = (
  error: unknown,
  req: RequestLike,
  res: ResponseLike,
  next?: ErrorHandlerNext,
) => void;

export interface StrongErrorHandlerFactory {
  (options?: ErrorHandlerOptions): StrongErrorHandler;
  writeErrorToResponse: (
    error: unknown,
    req: RequestLike,
    res: ResponseLike,
    options?: ErrorWriterOptions,
  ) => void;
}

export type ContentProducer = (
  res: ResponseLike,
  data: ErrorResponseData,
  options?: ErrorWriterOptions,
) => void;

export interface ErrorLike {
  [key: string]: unknown;
  code?: string;
  details?: unknown;
  expose?: boolean;
  message?: string;
  name?: string;
  stack?: string;
  status?: number;
  statusCode?: number;
}
