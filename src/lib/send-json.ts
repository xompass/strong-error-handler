import type {ErrorResponseData, ErrorWriterOptions, ResponseLike} from '../types';
import {safeJsonStringify} from './safe-json-stringify';

export function sendJson(
  res: ResponseLike,
  data: ErrorResponseData,
  options: ErrorWriterOptions = {},
) {
  const content =
    options.rootProperty === false ?
      safeJsonStringify(data) :
      safeJsonStringify({[options.rootProperty || 'error']: data});

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(content, 'utf-8');
}
