import { Module } from '@nestjs/common';
import { PassportModule } from '../../lib';
import { OptionsCheckController } from './options-check.controller';
import { OptionsCheckStrategy } from './options-check.strategy';

@Module({
  controllers: [OptionsCheckController],
  imports: [
    PassportModule.register({
      defaultStrategy: 'options-check',
      property: 'account',
      session: false
    })
  ],
  providers: [OptionsCheckStrategy]
})
export class OptionsCheckModule {}
