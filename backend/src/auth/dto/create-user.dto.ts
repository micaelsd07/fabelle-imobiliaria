import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const USER_ROLES = [
  'ADMIN',
  'GERENTE',
  'CORRETOR',
  'RECEPCIONISTA',
  'FINANCEIRO',
] as const;

export class CreateUserDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres.' })
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsIn(USER_ROLES, { message: 'Papel inválido.' })
  role!: (typeof USER_ROLES)[number];

  @IsOptional() @IsString() @MaxLength(40) creci?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(40) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(500) photo?: string;
  @IsOptional() @IsNumber() commissionRate?: number;
  @IsOptional() @IsNumber() salesMeta?: number;
}

export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(6) @MaxLength(128) password?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @IsOptional() @IsIn(USER_ROLES) role?: (typeof USER_ROLES)[number];
  @IsOptional() @IsString() @MaxLength(40) creci?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(40) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(500) photo?: string;
  @IsOptional() @IsNumber() commissionRate?: number;
  @IsOptional() @IsNumber() salesMeta?: number;
  @IsOptional() active?: boolean;
}
