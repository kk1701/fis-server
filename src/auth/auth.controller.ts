import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return this.authService.me(req.user.userId);
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-otp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOTP(body.email, body.otp);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(
    @Body() body: { email: string; resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.resetToken,
      body.newPassword,
    );
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
