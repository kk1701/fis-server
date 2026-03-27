import { Test, TestingModule } from '@nestjs/testing';
import { FacultyCoursesController } from './faculty-courses.controller';

describe('FacultyCoursesController', () => {
  let controller: FacultyCoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyCoursesController],
    }).compile();

    controller = module.get<FacultyCoursesController>(FacultyCoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
