import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';

@Injectable()
export class FacultyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // get or create the Faculty row for this user
  private async getOrCreateFaculty(userId: number, departmentId?: number) {
    let faculty = await this.prisma.faculty.findUnique({ where: { userId } });

    if (!faculty) {
      if (!departmentId) {
        throw new NotFoundException(
          'Faculty profile not found. Provide departmentId to initialize.',
        );
      }
      faculty = await this.prisma.faculty.create({
        data: { userId, departmentId, name: '' },
      });
    }
    return faculty;
  }

  async getOwnProfile(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      include: { department: true, addresses: true, degrees: true },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty profile not initialized yet');
    }
    return faculty;
  }

  async getProfileById(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { department: true, addresses: true, degrees: true },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');
    return faculty;
  }

  async updatePersonal(userId: number, dto: UpdatePersonalDto) {
    // ensure faculty row exists
    await this.getOrCreateFaculty(userId);

    return this.prisma.faculty.update({
      where: { userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.mobile && { mobile: dto.mobile }),
        ...(dto.photoUrl && { photoUrl: dto.photoUrl }),
        ...(dto.dob && { dob: new Date(dto.dob) }),
        ...(dto.gender && { gender: dto.gender as any }),
        ...(dto.nationality && { nationality: dto.nationality }),
        ...(dto.category && { category: dto.category }),
        ...(dto.orcidId && { orcidId: dto.orcidId }),
      },
    });
  }

  async updateAcademic(userId: number, dto: UpdateAcademicDto) {
    await this.getOrCreateFaculty(userId, dto.departmentId);

    return this.prisma.faculty.update({
      where: { userId },
      data: {
        ...(dto.designation && { designation: dto.designation }),
        ...(dto.highestQualification && {
          highestQualification: dto.highestQualification,
        }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.joiningDate && { joiningDate: new Date(dto.joiningDate) }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
      },
    });
  }

  // admin: update any faculty profile by facultyId
  async adminUpdateProfile(
    facultyId: number,
    dto: UpdatePersonalDto & UpdateAcademicDto,
  ) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.faculty.update({
      where: { id: facultyId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.mobile && { mobile: dto.mobile }),
        ...(dto.photoUrl && { photoUrl: dto.photoUrl }),
        ...(dto.dob && { dob: new Date(dto.dob) }),
        ...(dto.gender && { gender: dto.gender as any }),
        ...(dto.designation && { designation: dto.designation }),
        ...(dto.highestQualification && {
          highestQualification: dto.highestQualification,
        }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.joiningDate && { joiningDate: new Date(dto.joiningDate) }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
      },
    });
  }

  async getDirectory(params: {
    departmentId?: number;
    search?: string;
    specialization?: string;
    page: number;
    limit: number;
  }) {
    const { departmentId, search, specialization, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      user: { status: 'APPROVED' as const, deletedAt: null },
      ...(departmentId && { departmentId }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(specialization && {
        specialization: { has: specialization },
      }),
    };

    const [faculty, total] = await this.prisma.$transaction([
      this.prisma.faculty.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          designation: true,
          photoUrl: true,
          specialization: true,
          highestQualification: true,
          experienceYears: true,
          department: { select: { id: true, name: true, code: true } },
          _count: {
            select: { publications: true, coursesTaught: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.faculty.count({ where }),
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

  async getPublicProfile(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
      select: {
        id: true,
        name: true,
        designation: true,
        photoUrl: true,
        specialization: true,
        highestQualification: true,
        experienceYears: true,
        joiningDate: true,
        orcidId: true,
        department: { select: { id: true, name: true, code: true } },
        degrees: {
          select: {
            degreeName: true,
            specialization: true,
            institute: true,
            yearOfPassing: true,
          },
        },
        coursesTaught: {
          select: {
            semester: true,
            academicYear: true,
            role: true,
            catalogCourse: {
              select: { name: true, code: true, level: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        experiences: {
          select: {
            type: true,
            designation: true,
            organization: true,
            startDate: true,
            endDate: true,
            location: true,
          },
          orderBy: { startDate: 'desc' },
        },
        publications: {
          select: {
            title: true,
            category: true,
            authors: true,
            venue: true,
            year: true,
            doi: true,
            indexing: true,
          },
          orderBy: { year: 'desc' },
          take: 20,
        },
        theses: {
          select: {
            title: true,
            researchArea: true,
            year: true,
            status: true,
            role: true,
          },
        },
      },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    // verify faculty is approved before exposing public profile
    const user = await this.prisma.user.findFirst({
      where: { faculty: { id: facultyId }, status: 'APPROVED' },
    });
    if (!user) throw new NotFoundException('Faculty not found');

    return faculty;
  }
}
