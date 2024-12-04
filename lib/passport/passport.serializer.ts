import { IncomingMessage } from 'http';
import * as passport from 'passport';

export abstract class PassportSerializer<
  UserType extends unknown = unknown,
  PayloadType extends unknown = unknown,
  RequestType extends IncomingMessage = IncomingMessage
> {
  abstract serializeUser(
    user: UserType,
    req?: RequestType
  ): Promise<PayloadType> | PayloadType;
  abstract deserializeUser(
    payload: PayloadType,
    req?: RequestType
  ): Promise<UserType> | UserType;

  constructor() {
    const passportInstance = this.getPassportInstance();
    passportInstance.serializeUser(
      async (
        req: RequestType,
        user: UserType,
        done: (err: unknown, payload?: PayloadType) => unknown
      ) => {
        try {
          done(null, await this.serializeUser(user, req));
        } catch (err) {
          done(err);
        }
      }
    );
    passportInstance.deserializeUser(
      async (
        req: RequestType,
        payload: PayloadType,
        done: (err: unknown, user?: UserType) => unknown
      ) => {
        try {
          done(null, await this.deserializeUser(payload, req));
        } catch (err) {
          done(err);
        }
      }
    );
  }

  getPassportInstance() {
    return passport;
  }
}
