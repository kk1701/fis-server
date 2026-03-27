import { Test, TestingModule } from '@nestjs/testing';
import { FacultyCoursesService } from './faculty-courses.service';

describe('FacultyCoursesService', () => {
  let service: FacultyCoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyCoursesService],
    }).compile();

    service = module.get<FacultyCoursesService>(FacultyCoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
