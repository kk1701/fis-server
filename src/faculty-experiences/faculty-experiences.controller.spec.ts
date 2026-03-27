import { Test, TestingModule } from '@nestjs/testing';
import { FacultyExperiencesController } from './faculty-experiences.controller';

describe('FacultyExperiencesController', () => {
  let controller: FacultyExperiencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyExperiencesController],
    }).compile();

    controller = module.get<FacultyExperiencesController>(FacultyExperiencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
