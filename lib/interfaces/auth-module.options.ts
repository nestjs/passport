import { ModuleMetadata, Type } from '@nestjs/common';
import { AuthenticateOptions } from 'passport';

export interface IAuthModuleOptions<T = any> {
  defaultStrategy?: string | string[];
  session?: boolean;
  property?: string;
  autenticateOptions?: AuthenticateOptions;
  [key: string]: any;
}

export interface AuthOptionsFactory {
  createAuthOptions(): Promise<IAuthModuleOptions> | IAuthModuleOptions;
}

export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IAuthModuleOptions> | IAuthModuleOptions;
  inject?: any[];
}

export class AuthModuleOptions implements IAuthModuleOptions {
  defaultStrategy?: string | string[];
  session?: boolean;
  property?: string;
  autenticateOptions?: AuthenticateOptions;
}
