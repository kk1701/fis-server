import { Module } from '@nestjs/common';
import { FacultyPublicationsService } from './faculty-publications.service';
import { FacultyPublicationsController } from './faculty-publications.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyPublicationsController],
  providers: [FacultyPublicationsService, PrismaService],
})
export class FacultyPublicationsModule {}