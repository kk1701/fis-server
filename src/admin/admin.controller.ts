import {
  Controller, Get, Query,
  UseGuards, Res, ParseIntPipe,
  Optional,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  // admin: system stats
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  // admin: paginated faculty list with filters
  @Get('faculty')
  getFacultyList(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: AccountStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getFacultyList(
      departmentId ? parseInt(departmentId) : undefined,
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // admin: export faculty as CSV
  @Get('export/faculty')
  async exportFaculty(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: AccountStatus,
    @Res() res?: Response,
  ) {
    const csv = await this.service.exportFaculty(
      departmentId ? parseInt(departmentId) : undefined,
      status,
    );

    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', 'attachment; filename=faculty-export.csv');
    res?.send(csv);
  }
}