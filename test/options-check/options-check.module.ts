import { Module } from '@nestjs/common';
import { PassportModule } from '../../lib/index.js';
import { OptionsCheckController } from './options-check.controller.js';
import { OptionsCheckStrategy } from './options-check.strategy.js';

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
