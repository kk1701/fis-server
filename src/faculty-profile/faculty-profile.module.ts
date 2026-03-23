import { Module } from '@nestjs/common';
import { FacultyProfileService } from './faculty-profile.service';
import { FacultyProfileController } from './faculty-profile.controller';
import { PrismaService } from '../prisma.service';
import { ApprovedGuard } from './guards/approved.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyProfileController],
  providers: [FacultyProfileService, ApprovedGuard, PrismaService],
})
export class FacultyProfileModule {}