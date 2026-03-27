import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class UpdateCourseDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsInt()
  credits?: number;

  @IsOptional() @IsEnum(CourseLevel)
  courseLevel?: CourseLevel;
}