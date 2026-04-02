import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  ParseIntPipe,
  Optional,
  Patch,
  Post,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountStatus } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from '../departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '../departments/dto/update-department.dto';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';

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
    res?.setHeader(
      'Content-Disposition',
      'attachment; filename=faculty-export.csv',
    );
    res?.send(csv);
  }

  @Get('departments')
  getDepartments() {
    return this.service.getDepartments();
  }

  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.service.createDepartment(dto);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.service.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteDepartment(id);
  }

  // ── Courses ──────────────────────────────────────────────

  @Get('courses')
  getCourses(
    @Query('departmentId') departmentId?: string,
    @Query('level') level?: string,
  ) {
    return this.service.getCourses(
      departmentId ? parseInt(departmentId) : undefined,
      level,
    );
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.service.createCourse(dto);
  }

  @Patch('courses/:id')
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.service.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCourse(id);
  }

  @Patch('faculty/:userId/reset-password')
  resetFacultyPassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { newPassword: string },
  ) {
    return this.service.resetFacultyPassword(userId, body.newPassword);
  }
}
