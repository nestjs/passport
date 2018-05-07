import * as passport from 'passport';
import {
  CanActivate,
  ExecutionContext,
  mixin,
  UnauthorizedException
} from '@nestjs/common';
import { defaultOptions, AuthGuardOptions } from './options';

export function AuthGuard(
  type,
  options: AuthGuardOptions & any = defaultOptions
) {
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
        request[options.property || defaultOptions.property] = await passportFn(
          type,
          options
        );
        return true;
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
