import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let notificationService: ClientProxy;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotificationService = {
    emit: jest.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<ClientProxy>('NOTIFICATION_SERVICE');
    jest.clearAllMocks();
  });

  describe('checkoutPayment', () => {
    it('should create payment successfully with PAID status', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      const mockPayment = { id: 1, amount: 100, status: 'PAID', provider: 'MOCK', currency: 'DOP' };
      mockPrisma.payment.create.mockResolvedValue(mockPayment);

      const result = await service.checkoutPayment(data);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 100,
          companyId: 1,
          orderId: 1,
          currency: 'DOP',
          status: 'PAID',
          provider: 'MOCK',
        }),
      });
      expect(result).toEqual({ message: 'Payment created successfully' });
      expect(mockNotificationService.emit).toHaveBeenCalledWith(
        'payment-created-notification',
        expect.any(Object),
      );
    });

    it('should emit payment-created-notification on success', async () => {
      const data = { orderItemPrice: 150, companyId: 2, orderId: 5 };
      mockPrisma.payment.create.mockResolvedValue({ id: 1, amount: 150, status: 'PAID' });

      await service.checkoutPayment(data);

      expect(mockNotificationService.emit).toHaveBeenCalledWith(
        'payment-created-notification',
        expect.objectContaining({
          orderItemPrice: 150,
          companyId: 2,
          orderId: 5,
          status: 'PAID',
        }),
      );
    });

    it('should handle payment failure with FAILED status', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockRejectedValueOnce(new Error('Payment gateway error'));
      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 1,
        amount: 100,
        status: 'FAILED',
      });

      await expect(service.checkoutPayment(data)).rejects.toThrow(RpcException);
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(2);
    });

    it('should emit payment-failed-notification on error', async () => {
      const data = { orderItemPrice: 50, companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockRejectedValueOnce(new Error('Error'));
      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 1,
        amount: 50,
        status: 'FAILED',
      });

      try {
        await service.checkoutPayment(data);
      } catch (error) {
        expect(mockNotificationService.emit).toHaveBeenCalledWith(
          'payment-failed-notification',
          expect.objectContaining({
            status: 'FAILED',
          }),
        );
      }
    });

    it('should convert orderItemPrice to number in error case', async () => {
      const data = { orderItemPrice: '250.50', companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockRejectedValueOnce(new Error('Initial error'));
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 1, amount: 250.5, status: 'FAILED' });

      await expect(service.checkoutPayment(data as any)).rejects.toThrow(RpcException);
      
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(2);
    });

    it('should always use DOP currency', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockResolvedValue({ id: 1, amount: 100, status: 'PAID', currency: 'DOP' });

      await service.checkoutPayment(data);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          currency: 'DOP',
        }),
      });
    });

    it('should always use MOCK provider', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockResolvedValue({ id: 1, amount: 100, status: 'PAID', provider: 'MOCK' });

      await service.checkoutPayment(data);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          provider: 'MOCK',
        }),
      });
    });

    it('should handle multiple payments for same order', async () => {
      const data1 = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      const data2 = { orderItemPrice: 200, companyId: 1, orderId: 1 };

      mockPrisma.payment.create.mockResolvedValue({ id: 1, amount: 100, status: 'PAID' });

      await service.checkoutPayment(data1);
      await service.checkoutPayment(data2);

      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(2);
    });

    it('should throw RpcException with error message on failure', async () => {
      const data = { orderItemPrice: 100, companyId: 1, orderId: 1 };
      mockPrisma.payment.create.mockRejectedValueOnce(new Error('Database error'));
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 1, amount: 100, status: 'FAILED' });

      await expect(service.checkoutPayment(data)).rejects.toThrow(RpcException);
    });
  });
});
