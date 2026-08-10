import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Email no válido',
    },
  )
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
