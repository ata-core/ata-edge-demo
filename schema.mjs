// One plain JSON Schema, shared by the build script.
export const signupSchema = {
  $id: 'signup',
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 13 },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'name', 'email'],
}
