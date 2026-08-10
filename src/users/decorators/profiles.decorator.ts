import { SetMetadata } from '@nestjs/common';
import { UserProfile } from '../enums/user-profile.enum';

export const PROFILES_KEY = 'profiles';

export const Profiles = (...profiles: UserProfile[]) =>
  SetMetadata(PROFILES_KEY, profiles);
