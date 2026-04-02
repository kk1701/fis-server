import { Type } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum CourseRole {
  LECTURER = 'LECTURER',
  COORDINATOR = 'COORDINATOR',
  LAB = 'LAB',
}

export enum CourseMode {
  THEORY = 'THEORY',
  LAB = 'LAB',
}

export class CreateFacultyCourseDto {
  @Type(() => Number)
  @IsInt()
  courseId: number;

  @IsString() @IsNotEmpty()
  semester: string;

  @IsString() @IsNotEmpty()
  academicYear: string;

  @IsEnum(CourseRole)
  role: CourseRole;

  @IsOptional() @IsInt()
  hoursPerWeek?: number;

  @IsOptional() @IsEnum(CourseMode)
  mode?: CourseMode;

  @IsOptional() @IsString()
  notes?: string;
}