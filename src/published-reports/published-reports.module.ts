import { Module } from '@nestjs/common';
import { PublishedReportsService } from './published-reports.service';
import {
  AdminPublishedReportsController,
  PublicReportsController,
} from './published-reports.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminPublishedReportsController, PublicReportsController],
  providers: [PublishedReportsService, PrismaService],
})
export class PublishedReportsModule {}
