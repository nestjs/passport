import * as passport from 'passport';

export abstract class PassportSerializer {
  abstract serializeUser(user: any, done: Function): any;
  abstract deserializeUser(payload: any, done: Function): any;

  constructor() {
    const passportInstance = this.getPassportInstance();
    passportInstance.serializeUser((user, done) =>
      this.serializeUser(user, done)
    );
    passportInstance.deserializeUser((payload, done) =>
      this.deserializeUser(payload, done)
    );
  }

  getPassportInstance() {
    return passport;
  }
}
