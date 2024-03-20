/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
  mixin,
  Optional,
  UnauthorizedException
} from '@nestjs/common';
import * as passport from 'passport';
import { Type } from './interfaces';
import {
  AuthModuleOptions,
  IAuthModuleOptions
} from './interfaces/auth-module.options';
import { defaultOptions } from './options';
import { memoize } from './utils/memoize.util';

export type IAuthGuard = CanActivate & {
  logIn<TRequest extends { logIn: Function } = any>(
    request: TRequest
  ): Promise<void>;
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any
  ): TUser;
  getAuthenticateOptions(
    context: ExecutionContext
  ): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions | undefined;
  getRequest(context: ExecutionContext): any;
};

export const AuthGuard: (type?: string | string[]) => Type<IAuthGuard> =
  memoize(createAuthGuard);

const NO_STRATEGY_ERROR = `In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.`;
const authLogger = new Logger('AuthGuard');

function createAuthGuard(type?: string | string[]): Type<IAuthGuard> {
  class MixinAuthGuard<TUser = any> implements CanActivate {
    protected options: IAuthModuleOptions;

    constructor(
      @Optional()
      @Inject(AuthModuleOptions)
      options?: IAuthModuleOptions
    ) {
      this.options = options ?? {};
      if (!type && !this.options.defaultStrategy) {
        authLogger.error(NO_STRATEGY_ERROR);
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const options = this.options;
      const authenticateOptions = {
        ...defaultOptions.authenticateOptions,
        ...options.authenticateOptions,
        ...(await this.getAuthenticateOptions(context))
      };
      const [request, response] = [
        this.getRequest(context),
        this.getResponse(context)
      ];
      const passportFn = createPassportContext(request, response);
      const user = await passportFn(
        type || this.options.defaultStrategy,
        authenticateOptions,
        (err, user, info, status) =>
          this.handleRequest(err, user, info, context, status)
      );
      request[options.property || defaultOptions.property] = user;
      return true;
    }

    getRequest<T = any>(context: ExecutionContext): T {
      return context.switchToHttp().getRequest();
    }

    getResponse<T = any>(context: ExecutionContext): T {
      return context.switchToHttp().getResponse();
    }

    async logIn<TRequest extends { logIn: Function } = any>(
      request: TRequest
    ): Promise<void> {
      const user = request[this.options.property || defaultOptions.property];
      await new Promise<void>((resolve, reject) =>
        request.logIn(user, this.options, (err) =>
          err ? reject(err) : resolve()
        )
      );
    }

    handleRequest(err, user, info, context, status): TUser {
      if (err || !user) {
        throw err || new UnauthorizedException();
      }
      return user;
    }

    getAuthenticateOptions(
      context: ExecutionContext
    ): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions | undefined {
      return undefined;
    }
  }
  const guard = mixin(MixinAuthGuard);
  return guard as Type<IAuthGuard>;
}

const createPassportContext =
  (request, response) => (type, options, callback: Function) =>
    new Promise<void>((resolve, reject) =>
      passport.authenticate(type, options, (err, user, info, status) => {
        try {
          request.authInfo = info;
          return resolve(callback(err, user, info, status));
        } catch (err) {
          reject(err);
        }
      })(request, response, (err) => (err ? reject(err) : resolve()))
    );
