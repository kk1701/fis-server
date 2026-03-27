import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  code: string;

  @IsInt()
  departmentId: number;

  @IsEnum(CourseLevel)
  courseLevel: CourseLevel;

  @IsOptional() @IsInt()
  credits?: number;
}