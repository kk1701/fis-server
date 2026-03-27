import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFacultyCourseDto } from './dto/create-faculty-course.dto';
import { UpdateFacultyCourseDto } from './dto/update-faculty-course.dto';

@Injectable()
export class FacultyCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // helper — resolves userId -> Faculty, throws if not found
  private async resolveFaculty(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  // helper — fetch a course record and verify ownership
  private async resolveCourseRecord(recordId: number, facultyId: number, requesterRole: string) {
    const record = await this.prisma.courses.findUnique({
      where: { id: recordId },
    });

    if (!record) throw new NotFoundException('Course record not found');

    if (requesterRole !== 'ADMIN' && record.facultyId !== facultyId) {
      throw new ForbiddenException('You can only modify your own course records');
    }

    return record;
  }

  async create(userId: number, dto: CreateFacultyCourseDto) {
    const faculty = await this.resolveFaculty(userId);

    // verify course exists in catalog
    const catalogCourse = await this.prisma.courseCatalog.findUnique({
      where: { id: dto.courseId },
    });
    if (!catalogCourse) throw new NotFoundException('Course not found in catalog');

    return this.prisma.courses.create({
      data: {
        facultyId: faculty.id,
        catalogCourseId: dto.courseId,
        departmentId: catalogCourse.departmentId, // inherit from catalog
        semester: dto.semester,
        academicYear: dto.academicYear,
        role: dto.role,
        hoursPerWeek: dto.hoursPerWeek,
        mode: dto.mode,
        notes: dto.notes,
      },
      include: {
        catalogCourse: true,
        department: true,
      },
    });
  }

  async findOwn(userId: number, semester?: string, academicYear?: string) {
    const faculty = await this.resolveFaculty(userId);

    return this.prisma.courses.findMany({
      where: {
        facultyId: faculty.id,
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
      },
      include: {
        catalogCourse: {
          select: { id: true, name: true, code: true, level: true, credits: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFacultyId(facultyId: number, semester?: string, academicYear?: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.courses.findMany({
      where: {
        facultyId,
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
      },
      include: {
        catalogCourse: {
          select: { id: true, name: true, code: true, level: true, credits: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: number, recordId: number, dto: UpdateFacultyCourseDto, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveCourseRecord(recordId, faculty.id, requesterRole);

    return this.prisma.courses.update({
      where: { id: recordId },
      data: {
        ...(dto.semester && { semester: dto.semester }),
        ...(dto.academicYear && { academicYear: dto.academicYear }),
        ...(dto.role && { role: dto.role }),
        ...(dto.hoursPerWeek && { hoursPerWeek: dto.hoursPerWeek }),
        ...(dto.mode && { mode: dto.mode }),
        ...(dto.notes && { notes: dto.notes }),
      },
      include: {
        catalogCourse: true,
      },
    });
  }

  async remove(userId: number, recordId: number, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveCourseRecord(recordId, faculty.id, requesterRole);

    await this.prisma.courses.delete({ where: { id: recordId } });
    return { message: 'Course record deleted successfully' };
  }
}