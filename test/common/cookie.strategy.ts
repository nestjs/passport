import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '../../lib';
import { AppService } from './app.service';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appService: AppService) {
    super({
      cookieName: 'myCookie',
      signed: true,
      passReqToCallback: false
    });
  }

  validate(cookieValue: string) {
    return this.appService.findUserByCookieValue(cookieValue);
  }
}
