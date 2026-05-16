import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '../../lib/index.js';
import { AppController } from '../common/app.controller.js';
import { AppService } from '../common/app.service.js';
import { CookieStrategy } from '../common/cookie.strategy.js';
import { JwtStrategy } from '../common/jwt.strategy.js';
import { LocalUnionDiscriminatorCheckStrategy } from '../common/local-union-discriminator-check.strategy.js';
import { LocalStrategy } from '../common/local.strategy.js';

@Module({
  controllers: [AppController],
  imports: [
    JwtModule.register({
      secret: 's3cr3t'
    }),
    PassportModule
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
