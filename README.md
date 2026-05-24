# ata on the edge

A Cloudflare Worker that validates request bodies with [`ata-validator`](https://github.com/ata-core/ata-validator), compiled ahead of time to a static module.

The Workers runtime blocks `eval` and `new Function`. Runtime schema compilation, which is the default for both AJV (`ajv.compile`) and ata (`new Validator`), cannot run there. The answer for both is to compile the schema ahead of time into a static module. This demo does that with ata, and the output has no `eval`, no native addon, and no dependencies, so it runs as-is on Workers (and on Vercel Edge, Deno, or the browser).

## What this shows

`npm run build` turns `schema.mjs` into `dist/validator.ata.mjs`, then the Worker imports it:

```js
import { validate } from '../dist/validator.ata.mjs'
const result = validate(body)
```

A failed validation returns ata's errors with stable codes, on the edge:

```json
{
  "valid": false,
  "errors": [
    { "code": "ATA3001", "keyword": "format", "instancePath": "/email",
      "message": "must match format \"email\"",
      "docUrl": "https://ata-validator.com/e/ATA3001" }
  ]
}
```

## ata vs AJV standalone

The build script also emits an AJV standalone module for the same schema, so you can compare them. Both run on the edge. On this schema:

- ata: ~6.6 KB
- AJV standalone: ~4.8 KB

ata's module is larger because it embeds the error codes, messages, and doc links shown above. That is the trade: a bigger module for compiler-grade errors with no extra setup. If you only need a boolean and minimal errors, AJV standalone is smaller.

## Run it

```
npm install
npm run build
npm run dev      # local Workers runtime
npm run deploy   # needs a Cloudflare account
```
