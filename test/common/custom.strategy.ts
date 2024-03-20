import { ExecutionContext } from "@nestjs/common";
import { AuthenticateOptions, StrategyCreated } from "passport";
import { AuthGuard, PassportStrategy } from "../../lib";

export class CustomGuard extends AuthGuard('custom') {
  getAuthenticateOptions(context: ExecutionContext) : AuthenticateOptions {
      return { state: 'custom-state-from-guard' }
  }
}

export class CustomStrategy extends PassportStrategy(
  class { constructor(readonly callback: CustomStrategyVerifyFunction) { } },
  'custom'
) {
  async authenticate(this: this & StrategyCreated<this>, req: Request, options: AuthenticateOptions) {
    this.callback(options, (err, user, failure) => {
      if (err) {
        return this.error(err);
      }
      if (!user) {
        return this.fail(failure);
      }
      this.success(user, failure);
    });
  }

  validate(...[options]: Parameters<CustomStrategyVerifyFunction>) {
    return { id: 1, username: 'test', state: options.state };
  }
}

interface CustomStrategyVerifyFunction {
  (
    options: AuthenticateOptions,
    done: (error: any, user?: Express.User | false, info?: any) => void,
  ): void;
}
