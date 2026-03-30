const circularMarker = '[Circular]';

export function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    if (!isCircularJsonStringifyError(error)) {
      throw error;
    }
  }

  return JSON.stringify(value, createCircularReplacer());
}

function createCircularReplacer() {
  const ancestors: object[] = [];
  const activeAncestors = new WeakSet<object>();

  return function circularReplacer(this: unknown, _key: string, value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    while (
      ancestors.length > 0 &&
      ancestors[ancestors.length - 1] !== this
    ) {
      const ancestor = ancestors.pop();
      if (ancestor) {
        activeAncestors.delete(ancestor);
      }
    }

    if (activeAncestors.has(value as object)) {
      return circularMarker;
    }

    ancestors.push(value as object);
    activeAncestors.add(value as object);
    return value;
  };
}

function isCircularJsonStringifyError(error: unknown) {
  return error instanceof TypeError &&
    (
      error.message.includes('circular') ||
      error.message.includes('Circular')
    );
}
