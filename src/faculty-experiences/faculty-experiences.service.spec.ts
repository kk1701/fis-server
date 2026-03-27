import { Test, TestingModule } from '@nestjs/testing';
import { FacultyExperiencesService } from './faculty-experiences.service';

describe('FacultyExperiencesService', () => {
  let service: FacultyExperiencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyExperiencesService],
    }).compile();

    service = module.get<FacultyExperiencesService>(FacultyExperiencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
