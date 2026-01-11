import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('API Gateway E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({ message: 'Success', token: 'jwt-token' })),
      })
      .overrideProvider('USERS_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({
          role: 'ADMIN',
          status: 'ACTIVE',
          company_name: 'TestCorp',
          username: 'testuser',
          email: 'test@example.com',
        })),
      })
      .overrideProvider('ORDERS_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({ id: 1, status: 'CREATED' })),
      })
      .overrideProvider('PAYMENTS_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue(of({ message: 'Payment processed' })),
      })
      .overrideProvider('NOTIFICATION_SERVICE')
      .useValue({
        emit: jest.fn().mockReturnValue(of(true)),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Gateway Flow', () => {
    it('should have app module', () => {
      const appModule = app.get('AppModule');
      expect(appModule).toBeDefined();
    });

    it('should have auth controller', () => {
      const authController = app.get('AuthController');
      expect(authController).toBeDefined();
    });

    it('should have users controller', () => {
      const usersController = app.get('UsersController');
      expect(usersController).toBeDefined();
    });

    it('should have orders controller', () => {
      const ordersController = app.get('OrdersController');
      expect(ordersController).toBeDefined();
    });
  });

  describe('Service Integration', () => {
    it('should have all microservices connected', () => {
      expect(app.get('AUTH_SERVICE')).toBeDefined();
      expect(app.get('USERS_SERVICE')).toBeDefined();
      expect(app.get('ORDERS_SERVICE')).toBeDefined();
      expect(app.get('PAYMENTS_SERVICE')).toBeDefined();
      expect(app.get('NOTIFICATION_SERVICE')).toBeDefined();
    });
  });
});
