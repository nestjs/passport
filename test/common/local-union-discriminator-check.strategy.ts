import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '../../lib';
import { AppService } from './app.service';

@Injectable()
export class LocalUnionDiscriminatorCheckStrategy extends PassportStrategy(
  Strategy
) {
  constructor(private readonly appService: AppService) {
    super({
      usernameField: 'username',
      passReqToCallback: false
    });
  }

  validate(username: string, password: string) {
    return this.appService.findUser({ username, password });
  }
}
