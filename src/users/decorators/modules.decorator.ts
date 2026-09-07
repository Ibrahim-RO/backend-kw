import { SetMetadata } from '@nestjs/common';
import { ModuleKey } from '../enums/module-key.enum';

export const MODULE_KEY = 'requiredModule';

export const RequireModule = (module: ModuleKey) =>
  SetMetadata(MODULE_KEY, module);
