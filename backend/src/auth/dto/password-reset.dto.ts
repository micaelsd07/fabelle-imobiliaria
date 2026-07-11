import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  token!: string;

  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter ao menos 6 caracteres.' })
  @MaxLength(128)
  password!: string;
}
