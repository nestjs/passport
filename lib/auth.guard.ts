import {
  CanActivate,
  ExecutionContext,
  Logger,
  mixin,
  Optional,
  UnauthorizedException
} from '@nestjs/common';
import * as passport from 'passport';
import { Type } from './interfaces';
import { AuthModuleOptions } from './interfaces/auth-module.options';
import { defaultOptions } from './options';
import { memoize } from './utils/memoize.util';

export type IAuthGuard = CanActivate & {
  logIn<TRequest extends { logIn: Function } = any>(
    request: TRequest
  ): Promise<void>;
  handleRequest<TUser = any>(err, user, info, context): TUser;
};
export const AuthGuard: (
  type?: string | string[]
) => Type<IAuthGuard> = memoize(createAuthGuard);

const NO_STRATEGY_ERROR = `In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.`;

function createAuthGuard(type?: string | string[]): Type<CanActivate> {
  class MixinAuthGuard<TUser = any> implements CanActivate {
    private readonly logger = new Logger('AuthGuard');

    constructor(@Optional() protected readonly options?: AuthModuleOptions) {
      this.options = this.options || {};
      if (!type && !this.options.defaultStrategy) {
        this.logger.error(NO_STRATEGY_ERROR);
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const options = { ...defaultOptions, ...this.options };
      const [request, response] = [
        this.getRequest(context),
        context.switchToHttp().getResponse()
      ];
      const passportFn = createPassportContext(request, response);
      const user = await passportFn(
        type || this.options.defaultStrategy,
        options,
        (err, user, info) => this.handleRequest(err, user, info, context)
      );
      request[options.property || defaultOptions.property] = user;
      return true;
    }

    getRequest<T = any>(context: ExecutionContext): T {
      return context.switchToHttp().getRequest();
    }

    async logIn<TRequest extends { logIn: Function } = any>(
      request: TRequest
    ): Promise<void> {
      const user = request[this.options.property || defaultOptions.property];
      await new Promise((resolve, reject) =>
        request.logIn(user, err => (err ? reject(err) : resolve()))
      );
    }

    handleRequest(err, user, info, context): TUser {
      if (err || !user) {
        err && this.logger.error(err);
        info && this.logger.error(info.toString());
        throw err || new UnauthorizedException();
      }
      return user;
    }
  }
  const guard = mixin(MixinAuthGuard);
  return guard;
}

const createPassportContext = (request, response) => (
  type,
  options,
  callback: Function
) =>
  new Promise((resolve, reject) =>
    passport.authenticate(type, options, (err, user, info) => {
      try {
        request.authInfo = info;
        return resolve(callback(err, user, info));
      } catch (err) {
        reject(err);
      }
    })(request, response, err => (err ? reject(err) : resolve))
  );
