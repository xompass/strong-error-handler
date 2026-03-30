import util from 'node:util';

import type {RequestLike} from '../types';

export function logToConsole(req: RequestLike, error: unknown) {
  if (!Array.isArray(error)) {
    console.error(
      'Request %s %s failed: %s',
      req.method,
      req.url,
      formatError(error),
    );
    return;
  }

  const errors = error.map(formatError).join('\n');
  console.error(
    'Request %s %s failed with multiple errors:\n%s',
    req.method,
    req.url,
    errors,
  );
}

function formatError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'stack' in error) {
    return util.format('%s', (error as {stack?: string}).stack || error);
  }

  return util.format('%s', error);
}
