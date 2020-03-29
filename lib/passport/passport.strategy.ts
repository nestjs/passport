import * as passport from 'passport';
import { Type } from '../interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T,
  name?: string | undefined
): {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
} {
  abstract class MixinStrategy extends Strategy {
    abstract validate(...args: any[]): any;

    constructor(...args: ConstructorParameters<T>) {
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

      super(...args, (...params: any[]) => callback(...params));
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
