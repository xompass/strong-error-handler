import debugFactory from 'debug';

import {buildResponseData} from './data-builder';
import {logToConsole} from './logger';
import {negotiateContentProducer} from './content-negotiation';
import type {
  ErrorHandlerOptions,
  ErrorWriterOptions,
  RequestLike,
  ResponseLike,
} from '../types';

const debug = debugFactory('strong-error-handler');

export function createStrongErrorHandler(options: ErrorHandlerOptions = {}) {
  debug('Initializing with options %j', options);
  const logError = options.log !== false ? logToConsole : noop;

  return function strongErrorHandler(
    error: unknown,
    req: RequestLike,
    res: ResponseLike,
  ) {
    logError(req, error);
    writeErrorToResponse(error, req, res, options);
  };
}

export function writeErrorToResponse(
  error: unknown,
  req: RequestLike,
  res: ResponseLike,
  options: ErrorWriterOptions = {},
) {
  debug('Handling %s', getDebugValue(error));

  if (res.headersSent) {
    debug('Response was already sent, closing the underlying connection');
    req.socket?.destroy?.();
    return;
  }

  const writableError = coerceWritableError(error, res.statusCode);
  const data = buildResponseData(writableError, options);
  debug('Response status %s data %j', data.statusCode, data);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = data.statusCode;

  const sendResponse = negotiateContentProducer(req, warn, options);
  sendResponse(res, data, options);

  function warn(message: string) {
    res.setHeader('X-Warning', message);
    debug(message);
  }
}

function noop() {}

function getDebugValue(error: unknown) {
  if (typeof error === 'object' && error !== null && 'stack' in error) {
    return (error as {stack?: string}).stack || error;
  }

  return error;
}

function coerceWritableError(error: unknown, responseStatusCode: number) {
  if (typeof error !== 'object' || error === null) {
    return {
      statusCode: responseStatusCode >= 400 ? responseStatusCode : 500,
      message: String(error),
    };
  }

  const writableError = error as Record<string, unknown>;
  if (!writableError.status && !writableError.statusCode &&
    responseStatusCode >= 400) {
    writableError.statusCode = responseStatusCode;
  }

  return writableError;
}
