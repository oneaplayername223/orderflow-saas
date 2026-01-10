import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { OrdersModule } from '../src/orders/orders.module';
import { PrismaService } from '../src/orders/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('Orders Service E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider('PAYMENTS_SERVICE')
      .useValue({
        emit: jest.fn().mockReturnValue(of(true)),
      })
      .overrideProvider('NOTIFICATION_SERVICE')
      .useValue({
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

  describe('Orders Flow', () => {
    it('should have orders controller', () => {
      const ordersController = app.get('OrdersController');
      expect(ordersController).toBeDefined();
    });

    it('should have orders service', () => {
      const ordersService = app.get('OrdersService');
      expect(ordersService).toBeDefined();
    });

    it('should have prisma service', () => {
      expect(prismaService).toBeDefined();
    });
  });
});
