import createError from '@fastify/error';

export const NotFoundError = createError('NOT_FOUND', '%s not found.', 404);
export const AlreadyExistsError = createError(
  'RESOURCE_ALREADY_EXISTS',
  '%s already exists.',
  400
);
