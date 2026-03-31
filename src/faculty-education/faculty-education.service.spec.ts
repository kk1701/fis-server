import { Test, TestingModule } from '@nestjs/testing';
import { FacultyEducationService } from './faculty-education.service';

describe('FacultyEducationService', () => {
  let service: FacultyEducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyEducationService],
    }).compile();

    service = module.get<FacultyEducationService>(FacultyEducationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
