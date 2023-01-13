import createError from '@fastify/error';

export const NotFoundError = createError('NOT_FOUND', '%s not found.', 404);
export const AlreadyExistsError = createError(
  'RESOURCE_ALREADY_EXISTS',
  '%s already exists.',
  400
);
export const InsufficientBalanceError = createError(
  'INSUFFICENT_WALLET_BALANCE',
  'Wallet does not have sufficient balance for this operation',
  403
);
export const UnauthorizedError = createError('UNAUTHORIZED', 'Unauthorized', 401);
export const UnexpectedErorr = createError('UNEXPECTED_FATAL', 'Unexpected Fatal Error', 500);
