export const Schemas = {
  Error: {
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      code: { type: 'string' },
      error: { type: 'string' },
      message: { type: 'string' },
    }
  }
}
