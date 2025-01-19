import * as passport from 'passport';
import { Type, WithoutCallback } from '../interfaces';

type ExcludeUnknown<T> =
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Array<infer I> ? ({} extends I & {} ? T : never) : T;
export type AllConstructorParameters<T> = ExcludeUnknown<
  T extends {
    new (...o: infer U): void;
    new (...o: infer U2): void;
    new (...o: infer U3): void;
    new (...o: infer U4): void;
    new (...o: infer U5): void;
    new (...o: infer U6): void;
    new (...o: infer U7): void;
  }
    ? U | U2 | U3 | U4 | U5 | U6 | U7
    : T extends {
          new (...o: infer U): void;
          new (...o: infer U2): void;
          new (...o: infer U3): void;
          new (...o: infer U4): void;
          new (...o: infer U5): void;
          new (...o: infer U6): void;
        }
      ? U | U2 | U3 | U4 | U5 | U6
      : T extends {
            new (...o: infer U): void;
            new (...o: infer U2): void;
            new (...o: infer U3): void;
            new (...o: infer U4): void;
            new (...o: infer U5): void;
          }
        ? U | U2 | U3 | U4 | U5
        : T extends {
              new (...o: infer U): void;
              new (...o: infer U2): void;
              new (...o: infer U3): void;
              new (...o: infer U4): void;
            }
          ? U | U2 | U3 | U4
          : T extends {
                new (...o: infer U): void;
                new (...o: infer U2): void;
                new (...o: infer U3): void;
              }
            ? U | U2 | U3
            : T extends {
                  new (...o: infer U): void;
                  new (...o: infer U2): void;
                }
              ? U | U2
              : T extends {
                    new (...o: infer U): void;
                  }
                ? U
                : never
>;

abstract class PassportStrategyMixin<TValidationResult> {
  abstract validate(
    ...args: any[]
  ): TValidationResult | Promise<TValidationResult>;
}

export function PassportStrategy<
  T extends Type<any> = any,
  TUser = unknown,
  TValidationResult = TUser | false | null
>(
  Strategy: T,
  name?: string,
  callbackArity?: true | number
): {
  new (
    ...args: WithoutCallback<AllConstructorParameters<T>>
  ): InstanceType<T> & PassportStrategyMixin<TValidationResult>;
} {
  abstract class StrategyWithMixin
    extends Strategy
    implements PassportStrategyMixin<TValidationResult>
  {
    abstract validate(
      ...args: any[]
    ): TValidationResult | Promise<TValidationResult>;

    constructor(...args: any[]) {
      const callback = async (...params: any[]) => {
        const done = params[params.length - 1];
        try {
          const validateResult = await this.validate(...params);
          if (Array.isArray(validateResult)) {
            done(null, ...validateResult);
          } else {
            done(null, validateResult);
          }
        } catch (err) {
          done(err, null);
        }
      };

      if (callbackArity !== undefined) {
        const validate = new.target?.prototype?.validate;
        const arity =
          callbackArity === true ? validate.length + 1 : callbackArity;
        if (validate) {
          Object.defineProperty(callback, 'length', {
            value: arity
          });
        }
      }
      super(...args, callback);

      const passportInstance = this.getPassportInstance();
      if (name) {
        passportInstance.use(name, this as any);
      } else {
        passportInstance.use(this as any);
      }
    }

    getPassportInstance() {
      return passport;
    }
  }
  return StrategyWithMixin;
}
