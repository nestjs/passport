import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * @publicApi
 */
export interface IAuthModuleOptions {
  defaultStrategy?: string | string[];
  session?: boolean;
  property?: string;
  [key: string]: any;
}

/**
 * @publicApi
 */
export interface AuthOptionsFactory {
  createAuthOptions(): Promise<IAuthModuleOptions> | IAuthModuleOptions;
}

/**
 * @publicApi
 */
export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IAuthModuleOptions> | IAuthModuleOptions;
  inject?: any[];
}

/**
 * @publicApi
 */
export class AuthModuleOptions implements IAuthModuleOptions {
  defaultStrategy?: string | string[];
  session?: boolean;
  property?: string;
}
