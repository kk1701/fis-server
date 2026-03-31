import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpdateDegreeDto } from './dto/update-degree.dto';

// display order for degree levels
const LEVEL_ORDER = [
  'TENTH', 'TWELFTH', 'DIPLOMA',
  'GRADUATION', 'POST_GRADUATION', 'DOCTORATE', 'OTHER',
];

@Injectable()
export class FacultyEducationService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveFaculty(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  private async resolveDegree(degreeId: number, facultyId: number, requesterRole: string) {
    const degree = await this.prisma.degree.findUnique({ where: { id: degreeId } });
    if (!degree) throw new NotFoundException('Degree record not found');
    if (requesterRole !== 'ADMIN' && degree.facultyId !== facultyId) {
      throw new ForbiddenException('You can only modify your own education records');
    }
    return degree;
  }

  async create(userId: number, dto: CreateDegreeDto) {
    const faculty = await this.resolveFaculty(userId);

    // prevent duplicate level entries (except OTHER and DIPLOMA)
    if (!['OTHER', 'DIPLOMA'].includes(dto.level)) {
      const existing = await this.prisma.degree.findFirst({
        where: { facultyId: faculty.id, level: dto.level },
      });
      if (existing) {
        throw new ConflictException(`A ${dto.level} record already exists`);
      }
    }

    return this.prisma.degree.create({
      data: {
        facultyId: faculty.id,
        level: dto.level,
        degreeName: dto.degreeName,
        specialization: dto.specialization,
        institute: dto.institute,
        yearOfPassing: dto.yearOfPassing,
        score: dto.score,
        scoreType: dto.scoreType,
        division: dto.division,
      },
    });
  }

  async findOwn(userId: number) {
    const faculty = await this.resolveFaculty(userId);

    const degrees = await this.prisma.degree.findMany({
      where: { facultyId: faculty.id },
      orderBy: { yearOfPassing: 'asc' },
    });

    // sort by predefined level order
    return degrees.sort(
      (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
    );
  }

  async findByFacultyId(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const degrees = await this.prisma.degree.findMany({
      where: { facultyId },
      orderBy: { yearOfPassing: 'asc' },
    });

    return degrees.sort(
      (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
    );
  }

  async update(userId: number, degreeId: number, dto: UpdateDegreeDto, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveDegree(degreeId, faculty.id, requesterRole);

    return this.prisma.degree.update({
      where: { id: degreeId },
      data: {
        ...(dto.degreeName && { degreeName: dto.degreeName }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.institute && { institute: dto.institute }),
        ...(dto.yearOfPassing && { yearOfPassing: dto.yearOfPassing }),
        ...(dto.score !== undefined && { score: dto.score }),
        ...(dto.scoreType && { scoreType: dto.scoreType }),
        ...(dto.division && { division: dto.division }),
      },
    });
  }

  async remove(userId: number, degreeId: number, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveDegree(degreeId, faculty.id, requesterRole);
    await this.prisma.degree.delete({ where: { id: degreeId } });
    return { message: 'Degree record deleted successfully' };
  }
}