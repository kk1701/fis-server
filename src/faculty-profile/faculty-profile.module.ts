import { Module } from '@nestjs/common';
import { FacultyProfileService } from './faculty-profile.service';
import { FacultyProfileController } from './faculty-profile.controller';
import { PrismaService } from '../prisma.service';
import { ApprovedGuard } from './guards/approved.guard';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    AuthModule,
    CloudinaryModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [FacultyProfileController],
  providers: [FacultyProfileService, ApprovedGuard, PrismaService],
})
export class FacultyProfileModule {}
