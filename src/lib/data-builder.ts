import {STATUS_CODES} from 'node:http';

import {cloneAllProperties} from './clone';
import type {
  ErrorLike,
  ErrorResponseData,
  ErrorWriterOptions,
} from '../types';

export function buildResponseData(error: unknown, options: ErrorWriterOptions = {}) {
  if (Array.isArray(error)) {
    return serializeArrayOfErrors(error, options);
  }

  const normalizedError = normalizeError(error);
  const data: ErrorResponseData = {
    statusCode: resolveStatusCode(normalizedError),
  };

  if (options.debug) {
    cloneAllProperties(data, normalizedError);
    return data;
  }

  if (data.statusCode >= 400 && data.statusCode <= 499) {
    fillClientError(data, normalizedError);
  } else {
    fillServerError(data, normalizedError);
  }

  fillSafeFields(data, normalizedError, options.safeFields);
  return data;
}

function serializeArrayOfErrors(errors: unknown[], options: ErrorWriterOptions) {
  const details = new Array(errors.length);
  for (let index = 0; index < errors.length; index += 1) {
    details[index] = buildResponseData(errors[index], options);
  }

  return {
    statusCode: 500,
    message: 'Failed with multiple errors, see `details` for more information.',
    details,
  };
}

function normalizeError(error: unknown): ErrorLike {
  if (typeof error === 'object' && error !== null) {
    return error as ErrorLike;
  }

  return {
    statusCode: 500,
    message: String(error),
  };
}

function resolveStatusCode(error: ErrorLike) {
  const statusCode = error.statusCode || error.status;
  if (!statusCode || statusCode < 400) {
    return 500;
  }

  return statusCode;
}

function fillClientError(data: ErrorResponseData, error: ErrorLike) {
  data.name = error.name;
  data.message = error.message;
  data.code = error.code;
  data.details = error.details;
}

function fillServerError(data: ErrorResponseData, error: ErrorLike) {
  if (error.expose) {
    data.name = STATUS_CODES[data.statusCode] || 'Unknown Error';
    data.message = error.message;
  } else {
    data.message = STATUS_CODES[data.statusCode] || 'Unknown Error';
  }
}

function fillSafeFields(
  data: ErrorResponseData,
  error: ErrorLike,
  safeFields: string | string[] | undefined,
) {
  if (!safeFields) {
    return;
  }

  const fields = Array.isArray(safeFields) ? safeFields : [safeFields];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (error[field] !== undefined) {
      data[field] = error[field];
    }
  }
}
