import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateDissertationDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  specialization: string;

  @IsInt()
  year: number;

  @IsString() @IsNotEmpty()
  role: string;
}