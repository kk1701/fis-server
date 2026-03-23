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
        ...(dto.highestQualification && { highestQualification: dto.highestQualification }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.joiningDate && { joiningDate: new Date(dto.joiningDate) }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
      },
    });
  }

  // admin: update any faculty profile by facultyId
  async adminUpdateProfile(facultyId: number, dto: UpdatePersonalDto & UpdateAcademicDto) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
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
        ...(dto.highestQualification && { highestQualification: dto.highestQualification }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.joiningDate && { joiningDate: new Date(dto.joiningDate) }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
      },
    });
  }
}