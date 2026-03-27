import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ExperienceType } from '@prisma/client';

export class CreateExperienceDto {
  @IsEnum(ExperienceType)
  type: ExperienceType;

  @IsString() @IsNotEmpty()
  title: string; // maps to designation in DB

  @IsString() @IsNotEmpty()
  organization: string;

  @IsDateString()
  startDate: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  details: string;

  @IsOptional() @IsString()
  payScale?: string;
}