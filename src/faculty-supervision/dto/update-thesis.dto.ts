import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateThesisDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  researchArea?: string;

  @IsOptional() @IsInt()
  year?: number;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  role?: string;
}