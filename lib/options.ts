import { UnauthorizedException } from '@nestjs/common';

export interface AuthGuardOptions {
  session?: boolean;
  property?: string;
  infoProperty?: string;
  callback?: (err, user, info?) => any;
}

export const defaultOptions = {
  session: false,
  property: 'user',
  infoProperty: 'authInfo',
  callback: (err, user, info) => {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return {user, info};
  }
};
