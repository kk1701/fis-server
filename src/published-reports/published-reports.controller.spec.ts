import { Test, TestingModule } from '@nestjs/testing';
import { PublishedReportsController } from './published-reports.controller';

describe('PublishedReportsController', () => {
  let controller: PublishedReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedReportsController],
    }).compile();

    controller = module.get<PublishedReportsController>(PublishedReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
