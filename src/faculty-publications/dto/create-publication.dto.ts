import {
  IsString, IsNotEmpty, IsOptional,
  IsEnum, IsInt, IsArray, IsUrl, Min,
  isString
} from 'class-validator';
import { PublicationCategory } from '@prisma/client';

export class CreatePublicationDto {
  @IsEnum(PublicationCategory)
  type: PublicationCategory;

  @IsString() @IsNotEmpty()
  title: string;

  @IsArray() @IsString({ each: true })
  authors: string[];

  @IsOptional() @IsString()
  venue?: string;

  @IsInt() @Min(1900)
  year: number;

  @IsOptional() @IsString()
  doi?: string;

  @IsOptional() @IsString()
  url?: string;

  @IsOptional() @IsString()
  pages?: string;

  @IsOptional() @IsString()
  publisher?: string;

  @IsOptional() @IsString()
  indexing?: string;

  @IsOptional() @IsString()
  citation?: string;
}