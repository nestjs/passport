import * as passport from "passport";

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export abstract class AbstractStrategy {
  abstract validate(...args: any[]): any;
}

export function PassportStrategy<T extends Type<any> = any>(Strategy: T): any {
  abstract class MixinStrategy extends Strategy {
    abstract validate(...args: any[]): any;
    constructor(...args: any[]) {
      super(...args, (...params: any[]) => this.validate(...params));
      passport.use(this as any);
    }
  }
  return MixinStrategy;
}
