import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let paymentsService: ClientProxy;
  let notificationService: ClientProxy;

  const mockPrisma = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPaymentsService = {
    emit: jest.fn().mockReturnValue(of(true)),
  };

  const mockNotificationService = {
    emit: jest.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'PAYMENTS_SERVICE', useValue: mockPaymentsService },
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    paymentsService = module.get<ClientProxy>('PAYMENTS_SERVICE');
    notificationService = module.get<ClientProxy>('NOTIFICATION_SERVICE');
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order with items', async () => {
      const payload = {
        user_id: { accountId: 1, userId: 5 },
        type: 'PURCHASE',
        status: OrderStatus.CREATED,
        totalAmount: 100,
        assignedTo: null,
        items: [
          { referenceName: 'Item1', description: 'Desc1', quantity: 2, unitPrice: 50 },
        ],
      };

      const mockOrder = {
        id: 1,
        ...payload,
        items: [{ id: 1, referenceName: 'Item1', description: 'Desc1', quantity: 2, unitPrice: 50, subtotal: 100 }],
      };

      mockPrisma.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(payload);

      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should calculate subtotal for items', async () => {
      const payload = {
        user_id: { accountId: 1, userId: 5 },
        type: 'PURCHASE',
        totalAmount: 150,
        items: [
          { referenceName: 'Item1', description: 'Desc1', quantity: 3, unitPrice: 50 },
        ],
      };

      mockPrisma.order.create.mockResolvedValue({ id: 1, ...payload });

      await service.create(payload);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ subtotal: 150 }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should throw error if order creation fails', async () => {
      const payload = {
        user_id: { accountId: 1, userId: 5 },
        type: 'PURCHASE',
        totalAmount: 100,
        items: [],
      };

      mockPrisma.order.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(payload)).rejects.toThrow('Database error');
    });
  });

  describe('updateOrder', () => {
    it('should update order status', async () => {
      const payload = {
        orderId: 1,
        userId: 1,
        updateStatusDto: { status: OrderStatus.IN_PROGRESS },
      };

      const mockOrder = { id: 1, status: OrderStatus.IN_PROGRESS };
      mockPrisma.order.update.mockResolvedValue(mockOrder);

      const result = await service.updateOrder(payload);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.update).toHaveBeenCalled();
    });

    it('should throw error if trying to complete order', async () => {
      const payload = {
        orderId: 1,
        userId: 1,
        updateStatusDto: { status: OrderStatus.COMPLETED },
      };

      await expect(service.updateOrder(payload)).rejects.toThrow(RpcException);
    });

    it('should throw error if trying to change confirmed order', async () => {
      const payload = {
        orderId: 1,
        userId: 1,
        updateStatusDto: { status: OrderStatus.CONFIRMED },
      };

      await expect(service.updateOrder(payload)).rejects.toThrow(RpcException);
    });
  });

  describe('checkoutOrder', () => {
    it('should checkout order and process payment', async () => {
      const payload = {
        orderId: 1,
        accountId: 1,
        quantity: 2,
      };

      mockPrisma.order.update.mockResolvedValue({ id: 1, status: 'CONFIRMED' });
      mockPrisma.orderItem.findMany.mockResolvedValue([
        { id: 1, quantity: 5, subtotal: '100' },
        { id: 2, quantity: 3, subtotal: '60' },
      ]);
      mockPrisma.orderItem.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.checkoutOrder(payload);

      expect(result.orderId).toBe(1);
      expect(result.quantity).toBe(2);
      expect(mockNotificationService.emit).toHaveBeenCalledWith('order-confirmed-notification', expect.any(Object));
      expect(mockPaymentsService.emit).toHaveBeenCalledWith('checkout-payment', expect.any(Object));
    });

    it('should throw error if quantity is invalid', async () => {
      const payload = {
        orderId: 1,
        accountId: 1,
        quantity: null,
      };

      await expect(service.checkoutOrder(payload)).rejects.toThrow(RpcException);
    });

    it('should throw error if order not found', async () => {
      const payload = {
        orderId: 999,
        accountId: 1,
        quantity: 2,
      };

      mockPrisma.order.update.mockResolvedValue(null);

      await expect(service.checkoutOrder(payload)).rejects.toThrow(RpcException);
    });

    it('should throw error if insufficient order quantity', async () => {
      const payload = {
        orderId: 1,
        accountId: 1,
        quantity: 100,
      };

      mockPrisma.order.update.mockResolvedValue({ id: 1, status: 'CONFIRMED' });
      mockPrisma.orderItem.findMany.mockResolvedValue([
        { id: 1, quantity: 5, subtotal: '100' },
      ]);

      await expect(service.checkoutOrder(payload)).rejects.toThrow(RpcException);
    });
  });

  describe('getOrder', () => {
    it('should return single order with items', async () => {
      const payload = { orderId: 1, userId: 1 };
      const mockOrder = {
        id: 1,
        totalAmount: '100',
        items: [{ unitPrice: '50', subtotal: '100' }],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrder(payload);

      expect(result.id).toBe(1);
      expect(typeof result.totalAmount).toBe('number');
      expect(typeof result.items[0].unitPrice).toBe('number');
    });

    it('should throw error if order not found', async () => {
      const payload = { orderId: 999, userId: 1 };
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrder(payload)).rejects.toThrow(RpcException);
    });

    it('should convert decimal prices to numbers', async () => {
      const payload = { orderId: 1, userId: 1 };
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1,
        totalAmount: '250.50',
        items: [
          { unitPrice: '50.25', subtotal: '100.50' },
          { unitPrice: '75.00', subtotal: '150.00' },
        ],
      });

      const result = await service.getOrder(payload);

      expect(typeof result.totalAmount).toBe('number');
      expect(result.items.every(item => typeof item.unitPrice === 'number')).toBe(true);
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const payload = {
        user_id: 1,
        pagination: { limit: 10, page: 1 },
        dateFilter: {},
      };

      const mockOrders = [
        { id: 1, totalAmount: '100', createdAt: new Date() },
        { id: 2, totalAmount: '200', createdAt: new Date() },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getOrders(payload);

      expect(result).toHaveLength(2);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it('should filter by date range', async () => {
      const payload = {
        user_id: 1,
        pagination: { limit: 10, page: 1 },
        dateFilter: { startDate: '2024-01-01', endDate: '2024-12-31' },
      };

      mockPrisma.order.findMany.mockResolvedValue([]);

      await service.getOrders(payload);

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      const payload = {
        user_id: 1,
        pagination: { limit: 20, page: 3 },
        dateFilter: {},
      };

      mockPrisma.order.findMany.mockResolvedValue([]);

      await service.getOrders(payload);

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (3 - 1) * 20
          take: 20,
        }),
      );
    });

    it('should convert totalAmount to number in response', async () => {
      const payload = {
        user_id: 1,
        pagination: { limit: 10, page: 1 },
        dateFilter: {},
      };

      mockPrisma.order.findMany.mockResolvedValue([
        { id: 1, totalAmount: '100.50', createdAt: new Date() },
      ]);

      const result = await service.getOrders(payload);

      expect(typeof result[0].totalAmount).toBe('number');
    });
  });
});
