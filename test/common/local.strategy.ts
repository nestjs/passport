import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '../../lib';
import { AppService } from './app.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appService: AppService) {
    super();
  }
  validate(username: string, password: string) {
    return this.appService.findUser({ username, password });
  }
}
