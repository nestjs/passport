import { Strategy } from 'passport-local';
import { describe, expect, it } from 'vitest';
import { PassportStrategy } from '../../lib/index.js';

describe('PassportStrategy callbackArity', () => {
  it('should derive the verify callback arity from a validate method', () => {
    class MethodStrategy extends PassportStrategy(
      Strategy,
      'arity-method',
      true
    ) {
      validate(username: string, password: string) {
        return { username, password };
      }
    }

    const strategy = new MethodStrategy() as any;
    expect(strategy._verify.length).toBe(3);
  });

  it('should not throw when validate is not defined on the prototype', () => {
    class PropertyStrategy extends PassportStrategy(
      Strategy,
      'arity-property',
      true
    ) {
      validate = (username: string, password: string) => ({
        username,
        password
      });
    }

    expect(() => new PropertyStrategy()).not.toThrow();
  });

  it('should apply an explicit arity when validate is not defined on the prototype', () => {
    class PropertyStrategy extends PassportStrategy(
      Strategy,
      'arity-explicit',
      3
    ) {
      validate = (username: string, password: string) => ({
        username,
        password
      });
    }

    const strategy = new PropertyStrategy() as any;
    expect(strategy._verify.length).toBe(3);
  });
});
