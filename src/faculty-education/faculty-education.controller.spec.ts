import { Test, TestingModule } from '@nestjs/testing';
import { FacultyEducationController } from './faculty-education.controller';

describe('FacultyEducationController', () => {
  let controller: FacultyEducationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyEducationController],
    }).compile();

    controller = module.get<FacultyEducationController>(FacultyEducationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
