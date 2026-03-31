import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateThesisDto } from './dto/create-thesis.dto';
import { UpdateThesisDto } from './dto/update-thesis.dto';
import { CreateDissertationDto } from './dto/create-dissertation.dto';
import { UpdateDissertationDto } from './dto/update-dissertation.dto';

@Injectable()
export class FacultySupervisionService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveFaculty(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  private async resolveThesis(id: number, facultyId: number, role: string) {
    const record = await this.prisma.thesisSupervision.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Thesis record not found');
    if (role !== 'ADMIN' && record.facultyId !== facultyId) {
      throw new ForbiddenException(
        'You can only modify your own thesis records',
      );
    }
    return record;
  }

  private async resolveDissertation(
    id: number,
    facultyId: number,
    role: string,
  ) {
    const record = await this.prisma.dissertationSupervision.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Dissertation record not found');
    if (role !== 'ADMIN' && record.facultyId !== facultyId) {
      throw new ForbiddenException(
        'You can only modify your own dissertation records',
      );
    }
    return record;
  }

  // ── Thesis ────────────────────────────────────────────

  async createThesis(userId: number, dto: CreateThesisDto) {
    const faculty = await this.resolveFaculty(userId);
    return this.prisma.thesisSupervision.create({
      data: { facultyId: faculty.id, ...dto },
    });
  }

  async findOwnTheses(userId: number) {
    const faculty = await this.resolveFaculty(userId);
    return this.prisma.thesisSupervision.findMany({
      where: { facultyId: faculty.id },
      orderBy: { year: 'desc' },
    });
  }

  async findThesesByFacultyId(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return this.prisma.thesisSupervision.findMany({
      where: { facultyId },
      orderBy: { year: 'desc' },
    });
  }

  async updateThesis(
    userId: number,
    id: number,
    dto: UpdateThesisDto,
    role: string,
  ) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveThesis(id, faculty.id, role);
    return this.prisma.thesisSupervision.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.researchArea && { researchArea: dto.researchArea }),
        ...(dto.year && { year: dto.year }),
        ...(dto.status && { status: dto.status }),
        ...(dto.role && { role: dto.role }),
      },
    });
  }

  async removeThesis(userId: number, id: number, role: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveThesis(id, faculty.id, role);
    await this.prisma.thesisSupervision.delete({ where: { id } });
    return { message: 'Thesis record deleted successfully' };
  }

  // ── Dissertation ──────────────────────────────────────

  async createDissertation(userId: number, dto: CreateDissertationDto) {
    const faculty = await this.resolveFaculty(userId);
    return this.prisma.dissertationSupervision.create({
      data: { facultyId: faculty.id, ...dto },
    });
  }

  async findOwnDissertations(userId: number) {
    const faculty = await this.resolveFaculty(userId);
    return this.prisma.dissertationSupervision.findMany({
      where: { facultyId: faculty.id },
      orderBy: { year: 'desc' },
    });
  }

  async findDissertationsByFacultyId(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return this.prisma.dissertationSupervision.findMany({
      where: { facultyId },
      orderBy: { year: 'desc' },
    });
  }

  async updateDissertation(
    userId: number,
    id: number,
    dto: UpdateDissertationDto,
    role: string,
  ) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveDissertation(id, faculty.id, role);
    return this.prisma.dissertationSupervision.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.specialization && { specialization: dto.specialization }),
        ...(dto.year && { year: dto.year }),
        ...(dto.role && { role: dto.role }),
      },
    });
  }

  async removeDissertation(userId: number, id: number, role: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolveDissertation(id, faculty.id, role);
    await this.prisma.dissertationSupervision.delete({ where: { id } });
    return { message: 'Dissertation record deleted successfully' };
  }
}
