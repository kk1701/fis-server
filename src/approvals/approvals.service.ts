import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApprovalActionDto } from './dto/approval-action.dto';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPending() {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'PENDING',
        role: 'FACULTY',
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        faculty: {
          select: {
            name: true,
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // oldest first
    });

    // flatten for cleaner response
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.faculty?.name ?? 'Not set',
      department: u.faculty?.department ?? null,
      appliedAt: u.createdAt,
    }));
  }

  async approve(userId: number, adminId: number, dto: ApprovalActionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestException(`User is already ${user.status.toLowerCase()}`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        status: true,
        approvedAt: true,
        faculty: { select: { name: true } },
      },
    });

    // TODO: send approval email here when email service is set up
    // await this.mailService.sendApprovalEmail(updated.email, updated.faculty?.name)

    return {
      message: `Faculty account approved successfully`,
      user: updated,
    };
  }

  async reject(userId: number, adminId: number, dto: ApprovalActionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestException(`User is already ${user.status.toLowerCase()}`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'REJECTED',
        approvedById: adminId, // track which admin rejected too
        approvedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        status: true,
        faculty: { select: { name: true } },
      },
    });

    // TODO: send rejection email with dto.reason here
    // await this.mailService.sendRejectionEmail(updated.email, dto.reason)

    return {
      message: `Faculty account rejected${dto.reason ? `: ${dto.reason}` : ''}`,
      user: updated,
    };
  }
}