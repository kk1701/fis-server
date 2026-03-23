import { Test, TestingModule } from '@nestjs/testing';
import { FacultyProfileService } from './faculty-profile.service';

describe('FacultyProfileService', () => {
  let service: FacultyProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyProfileService],
    }).compile();

    service = module.get<FacultyProfileService>(FacultyProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
