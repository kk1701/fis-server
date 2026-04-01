import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('research-domains')
  getResearchDomains() {
    return this.service.getResearchDomains();
  }

  @Get('publication-trends')
  getPublicationTrends() {
    return this.service.getPublicationTrends();
  }

  @Get('department-health')
  getDepartmentHealth() {
    return this.service.getDepartmentHealth();
  }

  @Get('research-momentum')
  getResearchMomentum(@Query('departmentId') departmentId?: string) {
    return this.service.getResearchMomentum(
      departmentId ? parseInt(departmentId) : undefined,
    );
  }

  @Get('qualification-distribution')
  getQualificationDistribution() {
    return this.service.getQualificationDistribution();
  }

  @Get('experience-profile')
  getExperienceProfile() {
    return this.service.getExperienceProfile();
  }

  @Get('course-load')
  getCourseLoad(@Query('academicYear') academicYear?: string) {
    return this.service.getCourseLoad(academicYear);
  }

  @Get('supervision-pipeline')
  getSupervisionPipeline() {
    return this.service.getSupervisionPipeline();
  }
}