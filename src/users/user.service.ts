import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number, requesterId: number, requesterRole: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        faculty: {
          include: { department: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // faculty can only view their own record
    if (requesterRole === 'FACULTY' && requesterId !== id) {
      throw new ForbiddenException('You can only view your own account');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: number, dto: UpdateUserDto, requesterRole: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // only admin can update role or departmentId
    if (requesterRole !== 'ADMIN' && (dto.role || dto.departmentId)) {
      throw new ForbiddenException('Only admins can update role or department');
    }

    // update faculty name/department if present
    if (dto.name || dto.departmentId) {
      const faculty = await this.prisma.faculty.findUnique({
        where: { userId: id },
      });

      if (faculty) {
        await this.prisma.faculty.update({
          where: { userId: id },
          data: {
            ...(dto.name && { name: dto.name }),
            ...(dto.departmentId && { departmentId: dto.departmentId }),
          },
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.role && { role: dto.role }),
      },
    });

    const { passwordHash, ...result } = updated;
    return result;
  }

  async softDelete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const { passwordHash, ...result } = deleted;
    return { message: 'User deleted successfully', user: result };
  }
}