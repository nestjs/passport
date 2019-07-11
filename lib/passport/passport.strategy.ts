import * as passport from 'passport';
import { Type } from '../interfaces';

export function PassportStrategy<T extends Type<any> = any>(
  Strategy: T,
  name?: string | undefined
): {
  new (...args): T;
} {
  abstract class MixinStrategy extends Strategy {
    private readonly customParameters: { [key: string]: string };
    abstract validate(...args: any[]): any;

    authenticate(...args: any[]): void {
      const [req, params, ...rest] = args;
      if (
        this.customParameters &&
        typeof params === 'object' &&
        !Array.isArray(params)
      ) {
        super.authenticate(
          req,
          Object.assign(params, this.customParameters),
          ...rest
        );
      } else {
        super.authenticate(...args);
      }
    }

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

      super(...args, (...params: any[]) => callback(...params));

      const [config] = args || ([] as any);
      if (config && config.customParameters) {
        this.customParameters = config.customParameters;
      }

      if (name) {
        passport.use(name, this as any);
      } else {
        passport.use(this as any);
      }
    }
  }
  return MixinStrategy;
}
