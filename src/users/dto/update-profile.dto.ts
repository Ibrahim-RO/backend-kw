import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  last_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  surname_name?: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido',
    },
  )
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ValidateIf((dto: UpdateProfileDto) => !!dto.password)
  @IsString()
  @IsNotEmpty({ message: 'Debes indicar tu contraseña actual para cambiarla' })
  current_password?: string;
}
