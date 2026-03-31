import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FacultyProfileService } from './faculty-profile.service';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from './guards/approved.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('faculty')
@UseGuards(JwtAuthGuard)
export class FacultyProfileController {
  constructor(private readonly service: FacultyProfileService) {}

  // faculty: get own profile
  @Get('profile')
  getOwnProfile(@Request() req) {
    return this.service.getOwnProfile(req.user.userId);
  }

  // admin: get any faculty profile by facultyId
  @Get(':id/profile')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getProfileById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getProfileById(id);
  }

  // faculty: update personal fields
  @Patch('profile/personal')
  @UseGuards(ApprovedGuard)
  updatePersonal(@Request() req, @Body() dto: UpdatePersonalDto) {
    return this.service.updatePersonal(req.user.userId, dto);
  }

  // faculty: update academic fields
  @Patch('profile/academic')
  @UseGuards(ApprovedGuard)
  updateAcademic(@Request() req, @Body() dto: UpdateAcademicDto) {
    return this.service.updateAcademic(req.user.userId, dto);
  }

  // admin: update any faculty profile
  @Patch(':id/profile')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalDto & UpdateAcademicDto,
  ) {
    return this.service.adminUpdateProfile(id, dto);
  }

  // public: paginated faculty directory
  @Get('directory')
  getDirectory(
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getDirectory({
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      search,
      specialization,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    });
  }

  // public: single faculty public profile
  @Get(':id/public')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPublicProfile(id);
  }
}
