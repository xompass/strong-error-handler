const js2xmlparser = require('js2xmlparser') as typeof import('js2xmlparser');

import type {ErrorResponseData, ErrorWriterOptions, ResponseLike} from '../types';

export function sendXml(
  res: ResponseLike,
  data: ErrorResponseData,
  options: ErrorWriterOptions = {},
) {
  const root = options.rootProperty || 'error';
  const content = js2xmlparser.parse(root, data);
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.end(content, 'utf-8');
}
