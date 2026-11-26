/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
  mixin,
  Optional,
  UnauthorizedException
} from '@nestjs/common';
import passport from 'passport';
import { Type } from './interfaces/index.js';
import {
  AuthModuleOptions,
  IAuthModuleOptions
} from './interfaces/auth-module.options.js';
import { defaultOptions } from './options.js';
import { memoize } from './utils/memoize.util.js';

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
  ):
    | Promise<AuthGuardAuthenticateOptions>
    | AuthGuardAuthenticateOptions
    | undefined;
  getRequest(context: ExecutionContext): any;
};

export type AuthGuardAuthenticateOptions = passport.AuthenticateOptions & {
  defaultStrategy?: never;
  [key: string]: any;
};

/**
 * @publicApi
 */
export const AuthGuard: (type?: string | string[]) => Type<IAuthGuard> =
  memoize(createAuthGuard);

const NO_STRATEGY_ERROR = `In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.`;
const authLogger = new Logger('AuthGuard');
// Options returned by "getAuthenticateOptions" for a request, so that "logIn"
// uses the same ones as the authentication of that request
const authenticateOptionsByRequest = new WeakMap<
  object,
  AuthGuardAuthenticateOptions
>();

function createAuthGuard(type?: string | string[]): Type<IAuthGuard> {
  class MixinAuthGuard<TUser = any> implements CanActivate {
    @Optional()
    @Inject(AuthModuleOptions)
    protected options: AuthModuleOptions = {};

    constructor(@Optional() options?: AuthModuleOptions) {
      this.options = options ?? this.options;
      if (!type && !this.options.defaultStrategy) {
        authLogger.error(NO_STRATEGY_ERROR);
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const authenticateOptions = await this.getAuthenticateOptions(context);
      const options = {
        ...defaultOptions,
        ...this.options,
        ...authenticateOptions
      };
      const [request, response] = [
        this.getRequest(context),
        this.getResponse(context)
      ];
      if (authenticateOptions && request && typeof request === 'object') {
        authenticateOptionsByRequest.set(request, authenticateOptions);
      }
      const passportFn = createPassportContext(request, response);
      const user = await passportFn(
        type || this.options.defaultStrategy!,
        omitAuthModuleOptions(options),
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
      const options = {
        ...this.options,
        ...authenticateOptionsByRequest.get(request)
      };
      const user = request[options.property || defaultOptions.property];
      await new Promise<void>((resolve, reject) =>
        request.logIn(user, options, (err) => (err ? reject(err) : resolve()))
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
    ):
      | Promise<AuthGuardAuthenticateOptions>
      | AuthGuardAuthenticateOptions
      | undefined {
      return undefined;
    }
  }
  const guard = mixin(MixinAuthGuard);
  return guard as Type<IAuthGuard>;
}

function omitAuthModuleOptions(
  options: IAuthModuleOptions
): AuthGuardAuthenticateOptions {
  const { defaultStrategy, property, ...authenticateOptions } = options;
  return authenticateOptions;
}

const createPassportContext =
  (request: any, response: any) =>
  (type: string | string[], options: any, callback: Function) =>
    new Promise<void>((resolve, reject) =>
      passport.authenticate(type, options, (err, user, info, status) => {
        try {
          request.authInfo = info;
          return resolve(callback(err, user, info, status));
        } catch (err) {
          reject(err);
        }
      })(request, response, (err: any) => (err ? reject(err) : resolve()))
    );
