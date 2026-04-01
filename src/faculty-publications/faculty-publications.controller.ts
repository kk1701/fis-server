import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { FacultyPublicationsService } from './faculty-publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from '../faculty-profile/guards/approved.guard';
import { PublicationCategory } from '@prisma/client';

@Controller('faculty')
export class FacultyPublicationsController {
  constructor(private readonly service: FacultyPublicationsService) {}

  // faculty: add a publication
  @Post('publications')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  create(@Request() req, @Body() dto: CreatePublicationDto) {
    return this.service.create(req.user.userId, dto);
  }

  // faculty: list own publications grouped by type
  @Get('publications')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  findOwn(
    @Request() req,
    @Query('type') type?: PublicationCategory,
  ) {
    return this.service.findOwn(req.user.userId, type);
  }

  // admin/public: get any faculty's publications by facultyId
  @Get(':id/publications')
  findByFacultyId(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: PublicationCategory,
  ) {
    return this.service.findByFacultyId(id, type);
  }

  // faculty: update own publication
  @Patch('publications/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublicationDto,
  ) {
    return this.service.update(req.user.userId, id, dto, req.user.role);
  }

  // faculty or admin: delete publication
  @Delete('publications/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.userId, id, req.user.role);
  }
}