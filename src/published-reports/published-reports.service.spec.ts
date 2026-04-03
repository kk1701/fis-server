import { Test, TestingModule } from '@nestjs/testing';
import { PublishedReportsService } from './published-reports.service';

describe('PublishedReportsService', () => {
  let service: PublishedReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishedReportsService],
    }).compile();

    service = module.get<PublishedReportsService>(PublishedReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
