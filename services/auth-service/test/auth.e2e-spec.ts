import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/auth/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import bcrypt from 'bcrypt';

describe('Auth Service E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider('NOTIFICATION_SERVICE')
      .useValue({
        emit: jest.fn().mockReturnValue(of(true)),
      })
      .overrideProvider('USERS_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({ role: 'USER', status: 'ACTIVE' })),
        emit: jest.fn().mockReturnValue(of(true)),
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

  describe('Auth Flow', () => {
    it('should have auth controller', () => {
      const authController = app.get('AuthController');
      expect(authController).toBeDefined();
    });

    it('should have auth service', () => {
      const authService = app.get('AuthService');
      expect(authService).toBeDefined();
    });
  });
});
