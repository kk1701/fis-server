import { Module } from '@nestjs/common';
import { FacultyCoursesService } from './faculty-courses.service';
import { FacultyCoursesController } from './faculty-courses.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyCoursesController],
  providers: [FacultyCoursesService, PrismaService],
})
export class FacultyCoursesModule {}