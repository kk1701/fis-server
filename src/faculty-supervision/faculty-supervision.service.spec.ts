import { Test, TestingModule } from '@nestjs/testing';
import { FacultySupervisionService } from './faculty-supervision.service';

describe('FacultySupervisionService', () => {
  let service: FacultySupervisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultySupervisionService],
    }).compile();

    service = module.get<FacultySupervisionService>(FacultySupervisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
