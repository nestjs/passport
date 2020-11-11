import * as passport from 'passport';
import { Type } from '../interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T,
  name?: string | undefined
): {
  new (...args): InstanceType<T>;
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
      const arity = new.target.prototype.validate.length;
      const proxy = new Proxy(callback, {
        get: function (target, name, receiver) {
          return name === 'length'
            ? arity
            : Reflect.get(target, name, receiver);
        }
      });
      super(...args, proxy);
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
