import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PaymentsModule } from '../src/payments/payments.module';
import { PrismaService } from '../src/payments/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('Payments Service E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsModule],
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

  describe('Payments Flow', () => {
    it('should have payments controller', () => {
      const paymentsController = app.get('PaymentsController');
      expect(paymentsController).toBeDefined();
    });

    it('should have payments service', () => {
      const paymentsService = app.get('PaymentsService');
      expect(paymentsService).toBeDefined();
    });

    it('should have prisma service', () => {
      expect(prismaService).toBeDefined();
    });
  });
});
