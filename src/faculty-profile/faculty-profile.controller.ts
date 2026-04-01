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
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FacultyProfileService } from './faculty-profile.service';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovedGuard } from './guards/approved.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('faculty')
export class FacultyProfileController {
  constructor(
    private readonly service: FacultyProfileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getOwnProfile(@Request() req) {
    return this.service.getOwnProfile(req.user.userId);
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getProfileById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getProfileById(id);
  }

  @Patch('profile/personal')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  updatePersonal(@Request() req, @Body() dto: UpdatePersonalDto) {
    return this.service.updatePersonal(req.user.userId, dto);
  }

  @Patch('profile/academic')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  updateAcademic(@Request() req, @Body() dto: UpdateAcademicDto) {
    return this.service.updateAcademic(req.user.userId, dto);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalDto & UpdateAcademicDto,
  ) {
    return this.service.adminUpdateProfile(id, dto);
  }

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

  @Get(':id/public')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPublicProfile(id);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  getAddresses(@Request() req) {
    return this.service.getAddresses(req.user.userId);
  }

  @Patch('addresses')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  upsertAddress(
    @Request() req,
    @Query('type') type: 'CORRESPONDENCE' | 'PERMANENT',
    @Body() dto: any,
  ) {
    return this.service.upsertAddress(req.user.userId, type, dto);
  }

  @Delete('addresses')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  deleteAddress(
    @Request() req,
    @Query('type') type: 'CORRESPONDENCE' | 'PERMANENT',
  ) {
    return this.service.deleteAddress(req.user.userId, type);
  }

  @Post('profile/picture')
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const faculty = await this.service.getOwnProfile(req.user.userId);
    const url = await this.cloudinaryService.uploadProfilePicture(
      file,
      faculty.id,
    );
    return this.service.uploadProfilePicture(req.user.userId, url);
  }
}
