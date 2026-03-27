import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: { OR: [{ name: dto.name }, { code: dto.code }] },
    });

    if (existing) {
      throw new ConflictException('Department with this name or code already exists');
    }

    return this.prisma.department.create({ data: dto });
  }

  async findAll() {
    return this.prisma.department.findMany({
      select: { id: true, name: true, code: true },
    });
  }

  async findById(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: { id: true, name: true, designation: true },
        },
        courseCatalog: {
          select: { id: true, name: true, code: true, level: true },
        },
      },
    });

    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');

    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { faculty: true },
    });

    if (!dept) throw new NotFoundException('Department not found');

    // prevent deletion if faculty are assigned to this department
    if (dept.faculty.length > 0) {
      throw new ConflictException(
        `Cannot delete — ${dept.faculty.length} faculty member(s) are assigned to this department`,
      );
    }

    await this.prisma.department.delete({ where: { id } });
    return { message: 'Department deleted successfully' };
  }
}