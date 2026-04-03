import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PublishedReportsService } from './published-reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// ── Admin routes ──────────────────────────────────────────

@Controller('admin/published-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPublishedReportsController {
  constructor(private readonly service: PublishedReportsService) {}

  @Post()
  publish(
    @Request() req,
    @Body()
    dto: {
      title: string;
      description?: string;
      reportType: string;
      data: any;
    },
  ) {
    return this.service.publish(req.user.userId, dto);
  }

  @Get()
  findAll() {
    return this.service.findAllAdmin();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { title?: string; description?: string; isPublic?: boolean },
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

// ── Public routes ─────────────────────────────────────────

@Controller('public/reports')
export class PublicReportsController {
  constructor(private readonly service: PublishedReportsService) {}

  @Get()
  findAll() {
    return this.service.findAllPublic();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOnePublic(id);
  }
}
