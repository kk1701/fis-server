import { IsString, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  code?: string;
}