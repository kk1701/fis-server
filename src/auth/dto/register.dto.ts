import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // optionally allow specifying role (defaults to FACULTY)
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
