import * as passport from 'passport';

export abstract class PassportSerializer {
  abstract serializeUser(user: any, done: Function);
  abstract deserializeUser(payload: any, done: Function);

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
