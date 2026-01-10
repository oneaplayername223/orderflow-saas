import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { PrismaService } from '../src/users/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('Users Service E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({
          query: {
            email: 'test@example.com',
            username: 'testuser',
            company_name: 'TestCorp',
          },
        })),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Users Flow', () => {
    it('should have users controller', () => {
      const usersController = app.get('UsersController');
      expect(usersController).toBeDefined();
    });

    it('should have users service', () => {
      const usersService = app.get('UsersService');
      expect(usersService).toBeDefined();
    });

    it('should have prisma service', () => {
      expect(prismaService).toBeDefined();
    });
  });
});
