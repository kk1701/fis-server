import { Test, TestingModule } from '@nestjs/testing';
import { FacultyProfileController } from './faculty-profile.controller';

describe('FacultyProfileController', () => {
  let controller: FacultyProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyProfileController],
    }).compile();

    controller = module.get<FacultyProfileController>(FacultyProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
