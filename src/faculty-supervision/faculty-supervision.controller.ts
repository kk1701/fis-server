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
import { FacultySupervisionService } from './faculty-supervision.service';
import { CreateThesisDto } from './dto/create-thesis.dto';
import { UpdateThesisDto } from './dto/update-thesis.dto';
import { CreateDissertationDto } from './dto/create-dissertation.dto';
import { UpdateDissertationDto } from './dto/update-dissertation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from '../faculty-profile/guards/approved.guard';

@Controller('faculty')
export class FacultySupervisionController {
  constructor(private readonly service: FacultySupervisionService) {}

  // ── Thesis ────────────────────────────────────────────

  @Post('thesis')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  createThesis(@Request() req, @Body() dto: CreateThesisDto) {
    return this.service.createThesis(req.user.userId, dto);
  }

  @Get('thesis')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  findOwnTheses(@Request() req) {
    return this.service.findOwnTheses(req.user.userId);
  }

  @Get(':id/thesis')
  @UseGuards(JwtAuthGuard)
  findThesesByFacultyId(@Param('id', ParseIntPipe) id: number) {
    return this.service.findThesesByFacultyId(id);
  }

  @Patch('thesis/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  updateThesis(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThesisDto,
  ) {
    return this.service.updateThesis(req.user.userId, id, dto, req.user.role);
  }

  @Delete('thesis/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  removeThesis(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeThesis(req.user.userId, id, req.user.role);
  }

  // ── Dissertation ──────────────────────────────────────

  @Post('dissertation')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  createDissertation(@Request() req, @Body() dto: CreateDissertationDto) {
    return this.service.createDissertation(req.user.userId, dto);
  }

  @Get('dissertation')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  findOwnDissertations(@Request() req) {
    return this.service.findOwnDissertations(req.user.userId);
  }

  @Get(':id/dissertation')
  @UseGuards(JwtAuthGuard)
  findDissertationsByFacultyId(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDissertationsByFacultyId(id);
  }

  @Patch('dissertation/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  updateDissertation(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDissertationDto,
  ) {
    return this.service.updateDissertation(
      req.user.userId,
      id,
      dto,
      req.user.role,
    );
  }

  @Delete('dissertation/:id')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  removeDissertation(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeDissertation(req.user.userId, id, req.user.role);
  }
}
