import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateDissertationDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  specialization?: string;

  @IsOptional() @IsInt()
  year?: number;

  @IsOptional() @IsString()
  role?: string;
}