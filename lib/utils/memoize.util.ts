const defaultKey = 'default';

export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  // A `Map` is used instead of a plain object so that a strategy name that
  // collides with an inherited `Object.prototype` member (e.g. `__proto__`,
  // `constructor`, `toString`) is treated as an ordinary cache key. With a
  // plain object, `'__proto__' in cache` is already `true` and
  // `cache['__proto__']` returns `Object.prototype`, so `AuthGuard('__proto__')`
  // would hand back the prototype instead of memoizing a fresh mixin.
  const cache = new Map<unknown, ReturnType<T>>();
  return (...args: Parameters<T>): ReturnType<T> => {
    const n = args[0] || defaultKey;
    if (cache.has(n)) {
      return cache.get(n)!;
    }
    const result = fn(n === defaultKey ? undefined : n);
    cache.set(n, result);
    return result;
  };
}
