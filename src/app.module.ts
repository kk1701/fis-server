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

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, FacultyProfileModule, UsersModule, DepartmentsModule, CoursesModule, FacultyCoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
