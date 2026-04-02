import { PrismaService } from '../prisma.service';
import { AccountStatus } from '@prisma/client';
import { Parser } from 'json2csv';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateDepartmentDto } from '../departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '../departments/dto/update-department.dto';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalFaculty,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalCourses,
      totalDepartments,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { role: 'FACULTY', deletedAt: null } }),
      this.prisma.user.count({
        where: { role: 'FACULTY', status: 'APPROVED', deletedAt: null },
      }),
      this.prisma.user.count({
        where: { role: 'FACULTY', status: 'PENDING', deletedAt: null },
      }),
      this.prisma.user.count({
        where: { role: 'FACULTY', status: 'REJECTED', deletedAt: null },
      }),
      this.prisma.courseCatalog.count(),
      this.prisma.department.count(),
    ]);

    return {
      totalFaculty,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalCourses,
      totalDepartments,
    };
  }

  async getFacultyList(
    departmentId?: number,
    status?: AccountStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      role: 'FACULTY' as const,
      deletedAt: null,
      ...(status && { status }),
      ...(departmentId && {
        faculty: { departmentId },
      }),
    };

    const [faculty, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          faculty: {
            select: {
              id: true,
              name: true,
              designation: true,
              mobile: true,
              department: { select: { id: true, name: true, code: true } },
              _count: {
                select: {
                  publications: true,
                  experiences: true,
                  coursesTaught: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: faculty,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportFaculty(departmentId?: number, status?: AccountStatus) {
    const faculty = await this.prisma.user.findMany({
      where: {
        role: 'FACULTY',
        deletedAt: null,
        ...(status && { status }),
        ...(departmentId && { faculty: { departmentId } }),
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        faculty: {
          select: {
            name: true,
            designation: true,
            mobile: true,
            highestQualification: true,
            experienceYears: true,
            joiningDate: true,
            department: { select: { name: true, code: true } },
            _count: {
              select: {
                publications: true,
                experiences: true,
                coursesTaught: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // flatten nested structure for CSV rows
    const rows = faculty.map((u) => ({
      userId: u.id,
      email: u.email,
      status: u.status,
      name: u.faculty?.name ?? '',
      designation: u.faculty?.designation ?? '',
      mobile: u.faculty?.mobile ?? '',
      highestQualification: u.faculty?.highestQualification ?? '',
      experienceYears: u.faculty?.experienceYears ?? '',
      joiningDate: u.faculty?.joiningDate ?? '',
      department: u.faculty?.department?.name ?? '',
      departmentCode: u.faculty?.department?.code ?? '',
      totalPublications: u.faculty?._count?.publications ?? 0,
      totalExperiences: u.faculty?._count?.experiences ?? 0,
      totalCoursesTaught: u.faculty?._count?.coursesTaught ?? 0,
      registeredAt: u.createdAt,
      approvedAt: u.approvedAt ?? '',
    }));

    const parser = new Parser({
      fields: [
        'userId',
        'name',
        'email',
        'status',
        'designation',
        'mobile',
        'highestQualification',
        'experienceYears',
        'joiningDate',
        'department',
        'departmentCode',
        'totalPublications',
        'totalExperiences',
        'totalCoursesTaught',
        'registeredAt',
        'approvedAt',
      ],
    });

    return parser.parse(rows);
  }

  // ── Departments ──────────────────────────────────────────

  async getDepartments() {
    return this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: { faculty: true, courseCatalog: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: { OR: [{ name: dto.name }, { code: dto.code }] },
    });
    if (existing) {
      throw new ConflictException(
        'Department with this name or code already exists',
      );
    }
    return this.prisma.department.create({ data: dto });
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async deleteDepartment(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { faculty: true },
    });
    if (!dept) throw new NotFoundException('Department not found');
    if (dept.faculty.length > 0) {
      throw new ConflictException(
        `Cannot delete — ${dept.faculty.length} faculty member(s) assigned to this department`,
      );
    }
    await this.prisma.department.delete({ where: { id } });
    return { message: 'Department deleted successfully' };
  }

  // ── Courses ──────────────────────────────────────────────

  async getCourses(departmentId?: number, level?: string) {
    return this.prisma.courseCatalog.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(level && { level: level as any }),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { coursesTaught: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCourse(dto: CreateCourseDto) {
    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) throw new NotFoundException('Department not found');

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

  async updateCourse(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.courseCatalog.findUnique({
      where: { id },
    });
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

  async deleteCourse(id: number) {
    const course = await this.prisma.courseCatalog.findUnique({
      where: { id },
      include: { coursesTaught: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.coursesTaught.length > 0) {
      throw new ConflictException(
        `Cannot delete — ${course.coursesTaught.length} faculty course record(s) linked`,
      );
    }
    await this.prisma.courseCatalog.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  async resetFacultyPassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return { message: 'Password reset successfully' };
  }
}
