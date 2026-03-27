import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    // check department exists
    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) throw new NotFoundException('Department not found');

    // check course code is unique
    const existing = await this.prisma.courseCatalog.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Course code already exists');

    return this.prisma.courseCatalog.create({
      data: {
        name: dto.name,
        code: dto.code,
        departmentId: dto.departmentId,
        level: dto.courseLevel,
        credits: dto.credits,
      },
      include: { department: true },
    });
  }

  async findAll(departmentId?: number, level?: string) {
    return this.prisma.courseCatalog.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(level && { level: level as any }),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findById(id: number) {
    const course = await this.prisma.courseCatalog.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        coursesTaught: {
          select: {
            id: true,
            semester: true,
            academicYear: true,
            role: true,
            faculty: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.courseCatalog.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.courseCatalog.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.credits && { credits: dto.credits }),
        ...(dto.courseLevel && { level: dto.courseLevel }),
      },
      include: { department: true },
    });
  }

  async remove(id: number) {
    const course = await this.prisma.courseCatalog.findUnique({
      where: { id },
      include: { coursesTaught: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    // prevent deletion if faculty have records linked to this course
    if (course.coursesTaught.length > 0) {
      throw new ConflictException(
        `Cannot delete — ${course.coursesTaught.length} faculty course record(s) linked to this course`,
      );
    }

    await this.prisma.courseCatalog.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }
}