import { IsString, IsOptional, IsArray, IsDateString, IsInt } from 'class-validator';

export class UpdateAcademicDto {
  @IsOptional() @IsString()
  designation?: string;

  @IsOptional() @IsString()
  highestQualification?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  specialization?: string[];

  @IsOptional() @IsDateString()
  joiningDate?: string;

  @IsOptional() @IsInt()
  experienceYears?: number;

  @IsOptional() @IsInt()
  departmentId?: number;
}