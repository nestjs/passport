import * as passport from 'passport';
import { Type } from '../interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T,
  name?: string | undefined,
  callbackArity?: true | number
): {
  new (...args): InstanceType<T> & { getPassportInstance(): passport.PassportStatic };
} {
  abstract class MixinStrategy extends Strategy {
    abstract validate(...args: any[]): any;

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
  return MixinStrategy;
}
