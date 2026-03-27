import { Test, TestingModule } from '@nestjs/testing';
import { FacultyPublicationsService } from './faculty-publications.service';

describe('FacultyPublicationsService', () => {
  let service: FacultyPublicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyPublicationsService],
    }).compile();

    service = module.get<FacultyPublicationsService>(FacultyPublicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
