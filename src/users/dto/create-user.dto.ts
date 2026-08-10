import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UserProfile } from '../enums/user-profile.enum';

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
}
