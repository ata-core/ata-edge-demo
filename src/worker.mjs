// A Cloudflare Worker that validates request bodies with an ata-compiled
// validator. The validator is a static module built ahead of time (npm run
// build), so there is no eval / new Function at runtime, which is what the
// Workers runtime blocks. No native addon, no dependencies.
import { validate } from '../dist/validator.ata.mjs'

const EXAMPLE = { id: 1, name: 'Mert', email: 'mert@example.com', age: 26, tags: ['edge'] }

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      return json({
        usage: 'POST a JSON body to validate it against the signup schema.',
        example: EXAMPLE,
      })
    }
    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ valid: false, error: 'invalid JSON' }, 400)
    }

    const result = validate(body)
    if (result.valid) {
      return json({ valid: true, value: body })
    }
    return json({ valid: false, errors: result.errors }, 422)
  },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
