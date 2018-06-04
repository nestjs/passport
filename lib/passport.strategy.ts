import * as passport from 'passport';
import { Type } from './interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T
): {
  new (...args): T;
} {
  abstract class MixinStrategy extends Strategy {
    abstract validate(...args: any[]): any;
    constructor(...args: any[]) {
      super(...args, (...params: any[]) => this.validate(...params));
      passport.use(this as any);
    }
  }
  return MixinStrategy;
}
