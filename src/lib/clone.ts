import type {ErrorLike, ErrorResponseData} from '../types';

export function cloneAllProperties(data: ErrorResponseData, error: ErrorLike) {
  data.name = error.name;
  data.message = error.message;

  for (const key in error) {
    if (key in data) {
      continue;
    }

    data[key] = error[key];
  }

  data.stack = error.stack;
}
