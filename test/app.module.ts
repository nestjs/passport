import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '../lib';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [AppController],
  imports: [
    JwtModule.register({
      secret: 's3cr3t'
    }),
    PassportModule.register({})
  ],
  providers: [AppService, LocalStrategy, JwtStrategy]
})
export class AppModule {}
