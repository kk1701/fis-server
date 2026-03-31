import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class UpdateDegreeDto {
  @IsOptional() @IsString()
  degreeName?: string;

  @IsOptional() @IsString()
  specialization?: string;

  @IsOptional() @IsString()
  institute?: string;

  @IsOptional() @IsInt()
  yearOfPassing?: number;

  @IsOptional() @IsNumber()
  score?: number;

  @IsOptional() @IsString()
  scoreType?: string;

  @IsOptional() @IsString()
  division?: string;
}