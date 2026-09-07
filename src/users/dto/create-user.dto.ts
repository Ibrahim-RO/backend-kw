import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserProfile } from '../enums/user-profile.enum';
import { ModuleKey } from '../enums/module-key.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  last_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  surname_name!: string;

  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido',
    },
  )
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEnum(UserProfile, {
    message: `El perfil debe ser uno de los siguientes valores: ${Object.values(UserProfile).join(', ')}`,
  })
  @IsNotEmpty()
  profile!: UserProfile;

  // Solo relevante si profile es MARKETING; para ADMIN se ignora (siempre
  // tiene acceso a todo) — ver UsersService.create.
  @IsArray()
  @IsEnum(ModuleKey, {
    each: true,
    message: `Cada módulo debe ser uno de los siguientes valores: ${Object.values(ModuleKey).join(', ')}`,
  })
  @IsOptional()
  modules?: ModuleKey[];
}
