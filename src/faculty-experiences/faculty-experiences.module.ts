import { Module } from '@nestjs/common';
import { FacultyExperiencesService } from './faculty-experiences.service';
import { FacultyExperiencesController } from './faculty-experiences.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyExperiencesController],
  providers: [FacultyExperiencesService, PrismaService],
})
export class FacultyExperiencesModule {}