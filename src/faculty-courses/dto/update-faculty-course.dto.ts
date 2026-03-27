import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { CourseRole, CourseMode } from './create-faculty-course.dto';

export class UpdateFacultyCourseDto {
  @IsOptional() @IsString()
  semester?: string;

  @IsOptional() @IsString()
  academicYear?: string;

  @IsOptional() @IsEnum(CourseRole)
  role?: CourseRole;

  @IsOptional() @IsInt()
  hoursPerWeek?: number;

  @IsOptional() @IsEnum(CourseMode)
  mode?: CourseMode;

  @IsOptional() @IsString()
  notes?: string;
}