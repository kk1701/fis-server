import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperienceType } from '@prisma/client';

@Injectable()
export class FacultyExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveFaculty(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  private async resolveExperienceRecord(recordId: number, facultyId: number, requesterRole: string) {
    const record = await this.prisma.experience.findUnique({
      where: { id: recordId },
    });

    if (!record) throw new NotFoundException('Experience record not found');

    if (requesterRole !== 'ADMIN' && record.facultyId !== facultyId) {
      throw new ForbiddenException('You can only modify your own experience records');
    }

    return record;
  }

  async create(userId: number, dto: CreateExperienceDto) {
    const faculty = await this.resolveFaculty(userId);

    return this.prisma.experience.create({
      data: {
        facultyId: faculty.id,
        type: dto.type,
        designation: dto.title,
        organization: dto.organization,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        natureOfWork: dto.details,
        payScale: dto.payScale,
      },
    });
  }

  async findOwn(userId: number, type?: ExperienceType) {
    const faculty = await this.resolveFaculty(userId);

    const records = await this.prisma.experience.findMany({
      where: {
        facultyId: faculty.id,
        ...(type && { type }),
      },
      orderBy: { startDate: 'desc' },
    });

    // group by type for UI subsections
    return this.groupByType(records);
  }

  async findByFacultyId(facultyId: number, type?: ExperienceType) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const records = await this.prisma.experience.findMany({
      where: {
        facultyId,
        ...(type && { type }),
      },
      orderBy: { startDate: 'desc' },
    });

    return this.groupByType(records);
  }

  async update(userId: number, recordId: number, dto: UpdateExperienceDto, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveExperienceRecord(recordId, faculty.id, requesterRole);

    return this.prisma.experience.update({
      where: { id: recordId },
      data: {
        ...(dto.title && { designation: dto.title }),
        ...(dto.organization && { organization: dto.organization }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.location && { location: dto.location }),
        ...(dto.details && { natureOfWork: dto.details }),
        ...(dto.payScale && { payScale: dto.payScale }),
      },
    });
  }

  async remove(userId: number, recordId: number, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveExperienceRecord(recordId, faculty.id, requesterRole);

    await this.prisma.experience.delete({ where: { id: recordId } });
    return { message: 'Experience record deleted successfully' };
  }

  // groups flat array into { TEACHING: [], INDUSTRIAL: [], RESEARCH: [], ADMINISTRATIVE: [] }
  private groupByType(records: any[]) {
    return records.reduce(
      (acc, record) => {
        acc[record.type].push(record);
        return acc;
      },
      {
        TEACHING: [],
        INDUSTRIAL: [],
        RESEARCH: [],
        ADMINISTRATIVE: [],
      },
    );
  }
}