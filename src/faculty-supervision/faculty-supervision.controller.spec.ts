import { Test, TestingModule } from '@nestjs/testing';
import { FacultySupervisionController } from './faculty-supervision.controller';

describe('FacultySupervisionController', () => {
  let controller: FacultySupervisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultySupervisionController],
    }).compile();

    controller = module.get<FacultySupervisionController>(FacultySupervisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
