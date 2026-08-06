import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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

    @IsEmail({}, {
        message: 'El correo electrónico no tiene un formato válido',
    })
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

}
