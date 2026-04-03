import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FacultyProfileModule } from './faculty-profile/faculty-profile.module';
import { UsersModule } from './users/user.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { FacultyCoursesModule } from './faculty-courses/faculty-courses.module';
import { FacultyExperiencesModule } from './faculty-experiences/faculty-experiences.module';
import { FacultyPublicationsModule } from './faculty-publications/faculty-publications.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { AdminModule } from './admin/admin.module';
import { FacultyEducationModule } from './faculty-education/faculty-education.module';
import { FacultySupervisionModule } from './faculty-supervision/faculty-supervision.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';
import { PublishedReportsModule } from './published-reports/published-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    FacultyProfileModule,
    UsersModule,
    DepartmentsModule,
    CoursesModule,
    FacultyCoursesModule,
    FacultyExperiencesModule,
    FacultyPublicationsModule,
    ApprovalsModule,
    AdminModule,
    FacultyEducationModule,
    FacultySupervisionModule,
    AnalyticsModule,
    CloudinaryModule,
    MailModule,
    PublishedReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
