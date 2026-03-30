import {
  createStrongErrorHandler,
  writeErrorToResponse,
} from './lib/handler';
import type {StrongErrorHandlerFactory} from './types';

const strongErrorHandler = Object.assign(
  createStrongErrorHandler,
  {writeErrorToResponse},
) as StrongErrorHandlerFactory;

export = strongErrorHandler;
