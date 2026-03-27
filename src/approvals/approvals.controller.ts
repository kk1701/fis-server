import {
  Controller, Get, Post,
  Param, Body, Request,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // all routes in this controller are admin only
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  // admin: list all pending faculty accounts
  @Get('pending')
  getPending() {
    return this.service.getPending();
  }

  // admin: approve a faculty account
  @Post(':userId/approve')
  approve(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ApprovalActionDto,
    @Request() req,
  ) {
    return this.service.approve(userId, req.user.userId, dto);
  }

  // admin: reject a faculty account
  @Post(':userId/reject')
  reject(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ApprovalActionDto,
    @Request() req,
  ) {
    return this.service.reject(userId, req.user.userId, dto);
  }
}