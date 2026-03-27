import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateExperienceDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  organization?: string;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  details?: string;

  @IsOptional() @IsString()
  payScale?: string;
}