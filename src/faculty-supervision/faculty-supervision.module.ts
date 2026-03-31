import { Module } from '@nestjs/common';
import { FacultySupervisionService } from './faculty-supervision.service';
import { FacultySupervisionController } from './faculty-supervision.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultySupervisionController],
  providers: [FacultySupervisionService, PrismaService],
})
export class FacultySupervisionModule {}
