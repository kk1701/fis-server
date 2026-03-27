import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationCategory } from '@prisma/client';

@Injectable()
export class FacultyPublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveFaculty(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  private async resolvePublicationRecord(
    recordId: number,
    facultyId: number,
    requesterRole: string,
  ) {
    const record = await this.prisma.publication.findUnique({
      where: { id: recordId },
    });

    if (!record) throw new NotFoundException('Publication not found');

    if (requesterRole !== 'ADMIN' && record.facultyId !== facultyId) {
      throw new ForbiddenException('You can only modify your own publications');
    }

    return record;
  }

  async create(userId: number, dto: CreatePublicationDto) {
    const faculty = await this.resolveFaculty(userId);

    return this.prisma.publication.create({
      data: {
        facultyId: faculty.id,
        category: dto.type,
        title: dto.title,
        authors: dto.authors,
        venue: dto.venue,
        year: dto.year,
        doi: dto.doi,
        url: dto.url,
        pages: dto.pages,
        publisher: dto.publisher,
        citation: dto.citation,
        indexing: 'NONE', // default, faculty can update later
      },
    });
  }

  async findOwn(userId: number, type?: PublicationCategory) {
    const faculty = await this.resolveFaculty(userId);

    const records = await this.prisma.publication.findMany({
      where: {
        facultyId: faculty.id,
        ...(type && { category: type }),
      },
      orderBy: { year: 'desc' },
    });

    return this.groupByType(records);
  }

  async findByFacultyId(facultyId: number, type?: PublicationCategory) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const records = await this.prisma.publication.findMany({
      where: {
        facultyId,
        ...(type && { category: type }),
      },
      orderBy: { year: 'desc' },
    });

    return this.groupByType(records);
  }

  async update(
    userId: number,
    recordId: number,
    dto: UpdatePublicationDto,
    requesterRole: string,
  ) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolvePublicationRecord(recordId, faculty.id, requesterRole);

    return this.prisma.publication.update({
      where: { id: recordId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.authors && { authors: dto.authors }),
        ...(dto.venue && { venue: dto.venue }),
        ...(dto.year && { year: dto.year }),
        ...(dto.doi && { doi: dto.doi }),
        ...(dto.url && { url: dto.url }),
        ...(dto.pages && { pages: dto.pages }),
        ...(dto.publisher && { publisher: dto.publisher }),
        ...(dto.citation && { citation: dto.citation }),
      },
    });
  }

  async remove(userId: number, recordId: number, requesterRole: string) {
    const faculty = await this.resolveFaculty(userId);
    await this.resolvePublicationRecord(recordId, faculty.id, requesterRole);

    await this.prisma.publication.delete({ where: { id: recordId } });
    return { message: 'Publication deleted successfully' };
  }

  private groupByType(records: any[]) {
    return records.reduce(
      (acc, record) => {
        acc[record.category].push(record);
        return acc;
      },
      {
        JOURNAL: [],
        CONFERENCE: [],
        BOOK: [],
        BOOK_CHAPTER: [],
      },
    );
  }
}