# strong-error-handler

HTTP error writer for Express and LoopBack 3 style applications.

This fork is intentionally small:

- TypeScript source, build output in `dist/`
- English-only messages
- No i18n catalogs or `strong-globalize`
- Modern tooling with `tsdown`, `vitest`, and `oxlint`

## Installation

```bash
npm install strong-error-handler
```

## Usage

### Express middleware

```js
const express = require('express');
const errorHandler = require('strong-error-handler');

const app = express();

app.use(errorHandler({
  debug: process.env.NODE_ENV !== 'production',
  log: true,
}));
```

### Direct response writer

```js
const errorHandler = require('strong-error-handler');

errorHandler.writeErrorToResponse(
  new Error('something went wrong'),
  req,
  res,
  {debug: false},
);
```

## Response formats

The handler supports:

- `application/json` / `json`
- `text/html` / `html`
- `text/xml` / `xml`

Content type is negotiated from the request `Accept` header. You can also override it with the `_format` query parameter.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `debug` | `false` | Include full error details and stack traces in responses. |
| `log` | `true` | Log errors to `console.error`. |
| `safeFields` | `[]` | Extra error properties allowed through for safe responses. |
| `defaultType` | `"json"` | Fallback response type when negotiation does not resolve one. |
| `rootProperty` | `"error"` | Root property for JSON/XML responses. Use `false` to omit the JSON wrapper. |
| `negotiateContentType` | `true` | When `false`, always use `defaultType` unless `_format` overrides it. |

## Behavior

- `4xx` responses keep safe client-facing fields such as `message`, `details`, and `code`.
- `5xx` responses are sanitized by default to avoid leaking internals.
- When `debug: true`, the full error payload is returned.

## Development

```bash
npm run build
npm run typecheck
npm run lint
npm test
```

## License

MIT. See [LICENSE.md](./LICENSE.md).
