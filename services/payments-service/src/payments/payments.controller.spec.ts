import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    checkoutPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkoutPayment', () => {
    it('should process payment checkout', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      const mockResponse = { message: 'Payment created successfully' };
      mockPaymentsService.checkoutPayment.mockResolvedValue(mockResponse);

      const result = await controller.checkoutPayment(data);

      expect(result).toEqual(mockResponse);
      expect(service.checkoutPayment).toHaveBeenCalledWith(data);
    });

    it('should handle payment errors', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      mockPaymentsService.checkoutPayment.mockRejectedValue(new Error('Payment failed'));

      await expect(controller.checkoutPayment(data)).rejects.toThrow('Payment failed');
    });

    it('should pass through service response', async () => {
      const data = { orderItemPrice: 250, companyId: 2, orderId: 5 };
      const mockResponse = { message: 'Payment created successfully', transactionId: 'TX123' };
      mockPaymentsService.checkoutPayment.mockResolvedValue(mockResponse);

      const result = await controller.checkoutPayment(data);

      expect(result.message).toBe('Payment created successfully');
    });

    it('should handle various payment amounts', async () => {
      const testCases = [
        { orderItemPrice: 10, companyId: 1, orderId: 1 },
        { orderItemPrice: 1000, companyId: 1, orderId: 2 },
        { orderItemPrice: 0.01, companyId: 1, orderId: 3 },
      ];

      mockPaymentsService.checkoutPayment.mockResolvedValue({ message: 'Payment created successfully' });

      for (const testData of testCases) {
        const result = await controller.checkoutPayment(testData);
        expect(result).toHaveProperty('message');
      }

      expect(service.checkoutPayment).toHaveBeenCalledTimes(3);
    });
  });
});
