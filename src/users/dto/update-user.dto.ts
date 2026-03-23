import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  departmentId?: number;
}