import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PublishedReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(
    userId: number,
    dto: {
      title: string;
      description?: string;
      reportType: string;
      data: any;
    },
  ) {
    return this.prisma.publishedReport.create({
      data: {
        title: dto.title,
        description: dto.description,
        reportType: dto.reportType,
        data: dto.data,
        publishedById: userId,
      },
      include: {
        publishedBy: { select: { id: true, email: true } },
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.publishedReport.findMany({
      include: {
        publishedBy: { select: { id: true, email: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async update(
    id: number,
    dto: {
      title?: string;
      description?: string;
      isPublic?: boolean;
    },
  ) {
    const report = await this.prisma.publishedReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');

    return this.prisma.publishedReport.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async remove(id: number) {
    const report = await this.prisma.publishedReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.prisma.publishedReport.delete({ where: { id } });
    return { message: 'Report unpublished successfully' };
  }

  // ── Public endpoints ──────────────────────────────────

  async findAllPublic() {
    return this.prisma.publishedReport.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        title: true,
        description: true,
        reportType: true,
        publishedAt: true,
        publishedBy: { select: { id: true, email: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findOnePublic(id: number) {
    const report = await this.prisma.publishedReport.findUnique({
      where: { id },
      include: {
        publishedBy: { select: { id: true, email: true } },
      },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (!report.isPublic)
      throw new ForbiddenException('This report is not public');

    return report;
  }
}
