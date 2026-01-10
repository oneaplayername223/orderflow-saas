import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { ClientProxy } from '@nestjs/microservices';

describe('PaymentsController (API Gateway)', () => {
  let controller: PaymentsController;
  let paymentsService: ClientProxy;

  const mockPaymentsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: 'PAYMENTS_SERVICE',
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<ClientProxy>('PAYMENTS_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have PAYMENTS_SERVICE injected', () => {
    expect(paymentsService).toBeDefined();
  });
});
