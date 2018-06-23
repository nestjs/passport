import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import * as passport from 'passport';
import { Type } from './interfaces';
import { AuthGuardOptions, defaultOptions } from './options';

export function AuthGuard(
  type,
  options: AuthGuardOptions & { [key: string]: any } = defaultOptions
): Type<CanActivate> {
  options = { ...defaultOptions, ...options };
  const guard = mixin(
    class implements CanActivate {
      async canActivate(context: ExecutionContext): Promise<boolean> {
        const httpContext = context.switchToHttp();
        const [request, response] = [
          httpContext.getRequest(),
          httpContext.getResponse()
        ];
        const passportFn = createPassportContext(request, response);
        const user = await passportFn(type, options);
        request[options.property || defaultOptions.property] = user;
        return true;
      }

      async logIn<TRequest extends { logIn: Function } = any>(
        request: TRequest
      ): Promise<void> {
        const user = request[options.property || defaultOptions.property];
        await new Promise((resolve, reject) =>
          request.logIn(user, err => (err ? reject(err) : resolve()))
        );
      }
    }
  );
  return guard;
}

const createPassportContext = (request, response) => (type, options) =>
  new Promise((resolve, reject) =>
    passport.authenticate(type, options, (err, user, info) => {
      try {
        return resolve(options.callback(err, user, info));
      } catch (err) {
        reject(err);
      }
    })(request, response, resolve)
  );
