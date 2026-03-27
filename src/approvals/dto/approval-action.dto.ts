import { IsString, IsOptional } from 'class-validator';

export class ApprovalActionDto {
  @IsOptional() @IsString()
  reason?: string;
}