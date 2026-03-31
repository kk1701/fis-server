import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum DegreeLevel {
  TENTH = 'TENTH',
  TWELFTH = 'TWELFTH',
  DIPLOMA = 'DIPLOMA',
  GRADUATION = 'GRADUATION',
  POST_GRADUATION = 'POST_GRADUATION',
  DOCTORATE = 'DOCTORATE',
  OTHER = 'OTHER',
}

export class CreateDegreeDto {
  @IsEnum(DegreeLevel)
  level: DegreeLevel;

  @IsString() @IsNotEmpty()
  degreeName: string;

  @IsString() @IsNotEmpty()
  specialization: string;

  @IsString() @IsNotEmpty()
  institute: string;

  @IsInt()
  yearOfPassing: number;

  @IsOptional() @IsNumber()
  score?: number;

  @IsOptional() @IsString()
  scoreType?: string;

  @IsOptional() @IsString()
  division?: string;
}