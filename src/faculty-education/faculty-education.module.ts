import { Module } from '@nestjs/common';
import { FacultyEducationService } from './faculty-education.service';
import { FacultyEducationController } from './faculty-education.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyEducationController],
  providers: [FacultyEducationService, PrismaService],
})
export class FacultyEducationModule {}