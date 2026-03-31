import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateThesisDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  researchArea: string;

  @IsInt()
  year: number;

  @IsString() @IsNotEmpty()
  status: string;

  @IsString() @IsNotEmpty()
  role: string;
}