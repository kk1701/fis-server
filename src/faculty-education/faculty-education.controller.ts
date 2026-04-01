import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Request, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { FacultyEducationService } from './faculty-education.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpdateDegreeDto } from './dto/update-degree.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from '../faculty-profile/guards/approved.guard';

@Controller('faculty')
export class FacultyEducationController {
  constructor(private readonly service: FacultyEducationService) {}

  @Post('education')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  create(@Request() req, @Body() dto: CreateDegreeDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get('education')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  findOwn(@Request() req) {
    return this.service.findOwn(req.user.userId);
  }

  @Get(':id/education')
  findByFacultyId(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByFacultyId(id);
  }

  @Patch('education/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDegreeDto,
  ) {
    return this.service.update(req.user.userId, id, dto, req.user.role);
  }

  @Delete('education/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.userId, id, req.user.role);
  }
}