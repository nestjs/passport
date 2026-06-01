import { Injectable } from '@nestjs/common';
import * as passport from 'passport';

const PassportStrategyBase = require('passport-strategy');

@Injectable()
export class OptionsCheckStrategy extends PassportStrategyBase {
  name = 'options-check';

  constructor() {
    super();
    passport.use(this);
  }

  authenticate(req: any, options: Record<string, any>) {
    const leakedOptionKeys = ['defaultStrategy', 'property'].filter(
      (key) => key in options
    );

    if (leakedOptionKeys.length > 0) {
      return this.fail(
        { message: `Leaked options: ${leakedOptionKeys.join(', ')}` },
        401
      );
    }

    return this.success(
      { id: 'account-1' },
      {
        receivedSessionOption: options.session
      }
    );
  }
}
