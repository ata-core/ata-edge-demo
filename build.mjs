// Compiles the schema ahead of time into static validator modules, the form
// that runs on the edge where runtime code generation (eval / new Function) is
// blocked. Writes both an ata module and an AJV standalone module so the two
// can be compared on the same schema.
import { writeFileSync } from 'node:fs'
import { Validator } from 'ata-validator'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'
import { signupSchema } from './schema.mjs'

const ataSource = new Validator(signupSchema).toStandaloneModule({ format: 'esm' })
writeFileSync(new URL('./dist/validator.ata.mjs', import.meta.url), ataSource)

const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: false })
addFormats(ajv)
const ajvValidate = ajv.compile(signupSchema)
const ajvSource = standaloneCode.default(ajv, ajvValidate)
writeFileSync(new URL('./dist/validator.ajv.mjs', import.meta.url), ajvSource)

const bannedAta = ['eval(', 'new Function', 'require(', 'process.', 'node:', '.node"']
  .filter((p) => ataSource.includes(p))

console.log('ata module :', Buffer.byteLength(ataSource), 'bytes')
console.log('ajv module :', Buffer.byteLength(ajvSource), 'bytes')
console.log('ata edge-safe (no eval / native / node builtins):', bannedAta.length === 0)
if (bannedAta.length) {
  console.error('ata module is NOT edge-safe, found:', bannedAta)
  process.exit(1)
}
