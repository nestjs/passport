import { ExecutionContext } from '@nestjs/common';
import passport from 'passport';
import { describe, expect, it } from 'vitest';
import { AuthGuard } from '../../lib/index.js';

class LogInCheckStrategy extends passport.Strategy {
  name = 'log-in-check';

  authenticate() {
    return this.success({ id: 'account-1' });
  }
}
passport.use(new LogInCheckStrategy());

function createContext(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({})
    })
  } as unknown as ExecutionContext;
}

describe('AuthGuard#logIn', () => {
  it('should use the options returned by "getAuthenticateOptions"', async () => {
    class LogInGuard extends AuthGuard('log-in-check') {
      getAuthenticateOptions() {
        return { property: 'account', keepSessionInfo: true };
      }
    }
    const logInCalls: any[] = [];
    const request = {
      logIn: (user: any, options: any, done: (err?: any) => void) => {
        logInCalls.push({ user, options });
        done();
      }
    };
    const guard = new LogInGuard();

    await guard.canActivate(createContext(request));
    await guard.logIn(request);

    expect(logInCalls).toHaveLength(1);
    expect(logInCalls[0].user).toEqual({ id: 'account-1' });
    expect(logInCalls[0].options).toMatchObject({ keepSessionInfo: true });
  });

  it('should not pass the default "session: false" to "request.logIn"', async () => {
    const LogInGuard = AuthGuard('log-in-check');
    const logInCalls: any[] = [];
    const request = {
      logIn: (user: any, options: any, done: (err?: any) => void) => {
        logInCalls.push({ user, options });
        done();
      }
    };
    const guard = new LogInGuard();

    await guard.canActivate(createContext(request));
    await guard.logIn(request);

    expect(logInCalls[0].user).toEqual({ id: 'account-1' });
    expect(logInCalls[0].options.session).toBeUndefined();
  });
});
