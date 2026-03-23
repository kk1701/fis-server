import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdatePersonalDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  mobile?: string;

  @IsOptional() @IsString()
  photoUrl?: string;

  @IsOptional() @IsDateString()
  dob?: string;

  @IsOptional() @IsString()
  gender?: string;

  @IsOptional() @IsString()
  nationality?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  orcidId?: string;
}