import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AccountStatus } from '@prisma/client';
import { Parser } from 'json2csv';

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
      this.prisma.user.count({ where: { role: 'FACULTY', status: 'APPROVED', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'FACULTY', status: 'PENDING', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'FACULTY', status: 'REJECTED', deletedAt: null } }),
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
        'userId', 'name', 'email', 'status', 'designation',
        'mobile', 'highestQualification', 'experienceYears',
        'joiningDate', 'department', 'departmentCode',
        'totalPublications', 'totalExperiences', 'totalCoursesTaught',
        'registeredAt', 'approvedAt',
      ],
    });

    return parser.parse(rows);
  }
}