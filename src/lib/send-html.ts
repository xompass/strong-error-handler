import fs from 'node:fs';
import path from 'node:path';

import handlebars from 'handlebars';

import type {ErrorResponseData, ErrorWriterOptions, ResponseLike} from '../types';

const assetDir = path.resolve(__dirname, '../views');
const standardProps = new Set(['name', 'statusCode', 'message', 'stack']);
const stylesPartial = fs.readFileSync(path.join(assetDir, 'style.hbs'), 'utf8');
const defaultTemplate = handlebars.compile(
  fs.readFileSync(path.join(assetDir, 'default-error.hbs'), 'utf8'),
);

handlebars.registerHelper('partial', function partial(name: string) {
  if (name === 'style') {
    return stylesPartial;
  }

  return '';
});

handlebars.registerHelper('standardProps', function standardPropsHelper(
  property: string,
  options: handlebars.HelperOptions,
) {
  if (!standardProps.has(property)) {
    return options.fn(this);
  }

  return options.inverse(this);
});

export function sendHtml(
  res: ResponseLike,
  data: ErrorResponseData,
  options: ErrorWriterOptions = {},
) {
  const filteredData: Record<string, unknown> = {};

  for (const key in data) {
    const value = data[key];
    if (value !== undefined && value !== null || standardProps.has(key)) {
      filteredData[key] = value;
    }
  }

  const body = defaultTemplate({options, data: filteredData});
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body, 'utf-8');
}
