import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './passport.module-definition';

@Module({})
export class PassportModule extends ConfigurableModuleClass {}
