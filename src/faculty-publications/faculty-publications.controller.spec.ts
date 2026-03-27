import { Test, TestingModule } from '@nestjs/testing';
import { FacultyPublicationsController } from './faculty-publications.controller';

describe('FacultyPublicationsController', () => {
  let controller: FacultyPublicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyPublicationsController],
    }).compile();

    controller = module.get<FacultyPublicationsController>(FacultyPublicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
