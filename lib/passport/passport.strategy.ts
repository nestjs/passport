import * as passport from 'passport';
import { Type } from '../interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T,
  name?: string | undefined
): {
  new (...args): T;
} {
  abstract class MixinStrategy extends Strategy {
    abstract validate(...args: any[]): any;
    constructor(...args: any[]) {
      const callback = async (...params: any[]) => {
        const done = params[params.length - 1];
        try {
          done(null, await this.validate(...params));
        } catch (err) {
          done(err, null);
        }
      };

      super(...args, (...params: any[]) => callback(...params));
      if (name) {
        passport.use(name, this as any);
      } else {
        passport.use(this as any);
      }
    }
  }
  return MixinStrategy;
}
