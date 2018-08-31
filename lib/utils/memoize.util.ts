const defaultKey = 'default';

export function memoize(fn: Function) {
  let cache = {};
  return (...args) => {
    let n = args[0] || defaultKey;
    if (n in cache) {
      return cache[n];
    } else {
      let result = fn(n === defaultKey ? undefined : n);
      cache[n] = result;
      return result;
    }
  };
}
