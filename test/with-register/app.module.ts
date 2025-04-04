import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '../../lib';
import { AppController } from '../common/app.controller';
import { AppService } from '../common/app.service';
import { CookieStrategy } from '../common/cookie.strategy';
import { JwtStrategy } from '../common/jwt.strategy';
import { LocalUnionDiscriminatorCheckStrategy } from '../common/local-union-discriminator-check.strategy';
import { LocalStrategy } from '../common/local.strategy';

@Module({
  controllers: [AppController],
  imports: [
    JwtModule.register({
      secret: 's3cr3t'
    }),
    PassportModule.register({})
  ],
  providers: [
    AppService,
    LocalStrategy,
    LocalUnionDiscriminatorCheckStrategy,
    JwtStrategy,
    CookieStrategy
  ]
})
export class AppModule {}
