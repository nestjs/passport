import { ConfigurableModuleBuilder } from '@nestjs/common';
import { PassportModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<PassportModuleOptions>()
    .setFactoryMethodName('createAuthOptions')
    .build();
