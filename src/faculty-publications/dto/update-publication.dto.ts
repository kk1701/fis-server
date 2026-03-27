import {
  IsString, IsOptional, IsInt,
  IsArray, IsUrl, Min
} from 'class-validator';

export class UpdatePublicationDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  authors?: string[];

  @IsOptional() @IsString()
  venue?: string;

  @IsOptional() @IsInt() @Min(1900)
  year?: number;

  @IsOptional() @IsString()
  doi?: string;

  @IsOptional() @IsString()
  url?: string;

  @IsOptional() @IsString()
  pages?: string;

  @IsOptional() @IsString()
  publisher?: string;

  @IsOptional() @IsString()
  citation?: string;
}