import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // validate department exists if provided
    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) throw new BadRequestException('Department not found');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    // create user + faculty profile in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          role: dto.role ?? 'FACULTY',
        },
      });

      // only create Faculty row for FACULTY role
      if ((dto.role ?? 'FACULTY') === 'FACULTY') {
        await tx.faculty.create({
          data: {
            userId: newUser.id,
            name: dto.name,
            departmentId: dto.departmentId ?? 1, // fallback to first dept
          },
        });
      }

      return newUser;
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        faculty: {
          select: {
            id: true,
            name: true,
            designation: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { faculty: true },
    });

    // always return success to prevent email enumeration
    if (!user || user.deletedAt || user.role !== 'FACULTY') {
      return { message: 'If this email is registered, an OTP has been sent.' };
    }

    // generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // invalidate any existing OTPs for this email
    await this.prisma.oTP.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // store new OTP
    await this.prisma.oTP.create({
      data: { email, otpHash, expiresAt },
    });

    // send email
    const name = user.faculty?.name ?? 'Faculty';
    await this.mailService.sendOTP(email, otp, name);

    return { message: 'If this email is registered, an OTP has been sent.' };
  }

  async verifyOTP(email: string, otp: string) {
    const record = await this.prisma.oTP.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // generate a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // mark OTP as used and store reset token
    await this.prisma.$transaction([
      this.prisma.oTP.update({
        where: { id: record.id },
        data: { used: true },
      }),
      this.prisma.oTP.create({
        data: {
          email,
          otpHash: resetTokenHash,
          expiresAt,
          used: false,
        },
      }),
    ]);

    return { resetToken, message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const record = await this.prisma.oTP.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException(
        'Reset session expired. Please start over.',
      );
    }

    const isValid = await bcrypt.compare(resetToken, record.otpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid reset token');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email },
        data: { passwordHash: hash },
      }),
      this.prisma.oTP.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }
}
