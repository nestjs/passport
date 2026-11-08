import { describe, it, expect, vi } from 'vitest';
import { memoize } from '../../lib/utils/memoize.util.js';

describe('memoize', () => {
  it('caches by key and only calls the factory once per key', () => {
    const factory = vi.fn((k?: string) => ({ k }));
    const m = memoize(factory);
    const a1 = m('a');
    const a2 = m('a');
    const b1 = m('b');
    expect(a1).toBe(a2);
    expect(b1).not.toBe(a1);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('passes undefined to the factory for the default key', () => {
    const factory = vi.fn((k?: string) => k);
    const m = memoize(factory);
    expect(m()).toBeUndefined();
    expect(factory).toHaveBeenCalledWith(undefined);
  });

  it('returns the same value for arrays with the same contents', () => {
    const factory = vi.fn((k?: string[]) => ({ k }));
    const m = memoize(factory);
    expect(m(['a', 'b'])).toBe(m(['a', 'b']));
    expect(m(['a', 'b'])).not.toBe(m(['b', 'a']));
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('does not confuse a key that shadows an Object.prototype member', () => {
    // Regression: with a plain-object cache, memoize('__proto__') returned
    // Object.prototype and memoize('constructor') returned Object.
    const factory = vi.fn((k?: string) => ({ guardFor: k }));
    const m = memoize(factory);
    for (const key of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      const result = m(key) as any;
      expect(result).toEqual({ guardFor: key });
      expect(typeof result).toBe('object');
    }
    // Each distinct key produced its own memoized value.
    expect(factory).toHaveBeenCalledTimes(4);
  });
});
