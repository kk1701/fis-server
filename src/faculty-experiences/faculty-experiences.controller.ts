import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { FacultyExperiencesService } from './faculty-experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from '../faculty-profile/guards/approved.guard';
import { ExperienceType } from '@prisma/client';

@Controller('faculty')
@UseGuards(JwtAuthGuard)
export class FacultyExperiencesController {
  constructor(private readonly service: FacultyExperiencesService) {}

  // faculty: add experience entry
  @Post('experiences')
  @UseGuards(ApprovedGuard)
  create(@Request() req, @Body() dto: CreateExperienceDto) {
    return this.service.create(req.user.userId, dto);
  }

  // faculty: list own experiences grouped by type
  @Get('experiences')
  @UseGuards(ApprovedGuard)
  findOwn(
    @Request() req,
    @Query('type') type?: ExperienceType,
  ) {
    return this.service.findOwn(req.user.userId, type);
  }

  // admin/public: get any faculty's experiences by facultyId
  @Get(':id/experiences')
  findByFacultyId(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: ExperienceType,
  ) {
    return this.service.findByFacultyId(id, type);
  }

  // faculty: update own experience entry
  @Patch('experiences/:id')
  @UseGuards(ApprovedGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.service.update(req.user.userId, id, dto, req.user.role);
  }

  // faculty or admin: delete experience entry
  @Delete('experiences/:id')
  @UseGuards(ApprovedGuard)
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.userId, id, req.user.role);
  }
}