import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { FacultyCoursesService } from './faculty-courses.service';
import { CreateFacultyCourseDto } from './dto/create-faculty-course.dto';
import { UpdateFacultyCourseDto } from './dto/update-faculty-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApprovedGuard } from '../faculty-profile/guards/approved.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('faculty')
@UseGuards(JwtAuthGuard)
export class FacultyCoursesController {
  constructor(private readonly service: FacultyCoursesService) {}

  // faculty: add a course record
  @Post('courses')
  @UseGuards(ApprovedGuard)
  create(@Request() req, @Body() dto: CreateFacultyCourseDto) {
    return this.service.create(req.user.userId, dto);
  }

  // faculty: list own course records
  @Get('courses')
  @UseGuards(ApprovedGuard)
  findOwn(
    @Request() req,
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.service.findOwn(req.user.userId, semester, academicYear);
  }

  // admin/public: get any faculty's course history by facultyId
  @Get(':id/courses')
  findByFacultyId(
    @Param('id', ParseIntPipe) id: number,
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.service.findByFacultyId(id, semester, academicYear);
  }

  // faculty: update own course record
  @Patch('courses/:id')
  @UseGuards(ApprovedGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacultyCourseDto,
  ) {
    return this.service.update(req.user.userId, id, dto, req.user.role);
  }

  // faculty or admin: delete course record
  @Delete('courses/:id')
  @UseGuards(ApprovedGuard)
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.userId, id, req.user.role);
  }
}