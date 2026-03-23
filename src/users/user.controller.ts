import {
  Controller, Get, Patch, Delete,
  Param, Body, Request,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // admin or faculty (faculty can only fetch their own)
  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.service.findById(id, req.user.userId, req.user.role);
  }

  // admin: update any user | faculty: update own email only
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    return this.service.update(id, dto, req.user.role);
  }

  // admin only
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }
}