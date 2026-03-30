import accepts from 'accepts';
import debugFactory from 'debug';
import util from 'node:util';

import {sendHtml} from './send-html';
import {sendJson} from './send-json';
import {sendXml} from './send-xml';
import type {
  ContentProducer,
  ErrorWriterOptions,
  RequestLike,
} from '../types';

const debug = debugFactory('strong-error-handler:http-response');
const supportedTypes = [
  'application/json',
  'json',
  'text/html',
  'html',
  'text/xml',
  'xml',
] as const;
const supportedTypeSet = new Set<string>(supportedTypes);

export function negotiateContentProducer(
  req: RequestLike,
  logWarning: (message: string) => void,
  options: ErrorWriterOptions = {},
) {
  let defaultType = 'json';
  if (typeof options.defaultType === 'string' &&
    supportedTypeSet.has(options.defaultType)) {
    debug('Accepting options.defaultType `%s`', options.defaultType);
    defaultType = options.defaultType;
  } else if (options.defaultType) {
    debug(
      'defaultType: `%s` is not supported, falling back to defaultType: `%s`',
      options.defaultType,
      defaultType,
    );
  }

  const resolvedContentType = accepts(req).types([...supportedTypes]);
  let contentType = resolvedContentType || defaultType;

  if (options.negotiateContentType === false) {
    if (typeof options.defaultType === 'string' &&
      supportedTypeSet.has(options.defaultType)) {
      contentType = options.defaultType;
      debug('Forcing options.defaultType `%s`', options.defaultType);
    } else {
      debug(
        'contentType: `%s` is not supported, falling back to contentType: `%s`',
        options.defaultType,
        contentType,
      );
    }
  }

  const query = req.query || {};
  if (typeof query._format === 'string') {
    if (supportedTypeSet.has(query._format)) {
      contentType = query._format;
    } else {
      logWarning(util.format(
        'Response _format "%s" is not supported, used "%s" instead',
        query._format,
        defaultType,
      ));
    }
  }

  debug(
    'Content-negotiation: req.headers.accept: `%s` resolved as: `%s`',
    req.headers?.accept,
    contentType,
  );

  return resolveOperation(contentType);
}

function resolveOperation(contentType: string): ContentProducer {
  switch (contentType) {
    case 'application/json':
    case 'json':
      return sendJson;
    case 'text/html':
    case 'html':
      return sendHtml;
    case 'text/xml':
    case 'xml':
      return sendXml;
    default:
      return sendJson;
  }
}
