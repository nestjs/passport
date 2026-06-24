import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '../../lib/index.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 's3cr3t',
      passReqToCallback: true
    });
  }

  validate(req: Request, payload: Record<string, any>) {
    console.log({ req });
    return { id: payload.id, email: payload.email };
  }
}
