const defaultKey = 'default';

export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache: Record<string, ReturnType<T>> = {};
  return (...args: Parameters<T>): ReturnType<T> => {
    const n = args[0] || defaultKey;
    if (n in cache) {
      return cache[n];
    } else {
      const result = fn(n === defaultKey ? undefined : n);
      cache[n] = result;
      return result;
    }
  };
}
