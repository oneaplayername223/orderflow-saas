import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('OrdersController (API Gateway)', () => {
  let controller: OrdersController;
  let ordersService: ClientProxy;

  const mockOrdersService = {
    send: jest.fn().mockReturnValue(of({ id: 1, status: 'CREATED' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: 'ORDERS_SERVICE',
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<ClientProxy>('ORDERS_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order with user info', async () => {
      const createOrderDto = {
        type: 'PURCHASE',
        totalAmount: 100,
        assignedTo: null,
        items: [{ referenceName: 'Item1', description: 'Desc', quantity: 2, unitPrice: 50 }],
      };
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of({ id: 1, status: 'CREATED' }));

      const result = controller.createOrder(createOrderDto as any, mockReq, {});
      const resolvedResult = await firstValueFrom(result);

      expect(mockOrdersService.send).toHaveBeenCalledWith('create-order', expect.objectContaining({
        user_id: { accountId: 1, userId: 5 },
        type: 'PURCHASE',
        totalAmount: 100,
      }));
      expect(resolvedResult).toEqual({ id: 1, status: 'CREATED' });
    });

    it('should include user context in payload', async () => {
      const createOrderDto = { type: 'SALE', totalAmount: 250, items: [] };
      const mockReq = { user: { accountId: 2, userId: 10 } };

      const result = controller.createOrder(createOrderDto as any, mockReq, {});
      await firstValueFrom(result);

      expect(mockOrdersService.send).toHaveBeenCalledWith('create-order', expect.objectContaining({
        user_id: mockReq.user,
      }));
    });

    it('should handle order creation errors', async () => {
      const createOrderDto = { type: 'SALE', totalAmount: 100, items: [] };
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of(null));

      const result = controller.createOrder(createOrderDto as any, mockReq, {});
      const resolvedResult = await firstValueFrom(result);

      expect(resolvedResult).toBeNull();
    });
  });

  describe('getOrders', () => {
    it('should retrieve orders with pagination', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };
      const mockOrders = [
        { id: 1, totalAmount: 100, status: 'CREATED' },
        { id: 2, totalAmount: 200, status: 'PROCESSING' },
      ];

      mockOrdersService.send.mockReturnValue(of(mockOrders));

      const result = await controller.getOrders(mockReq, 10 as any, 1 as any);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-orders', expect.objectContaining({
        pagination: { limit: 10, page: 1 },
        user_id: 1,
      }));
    });

    it('should use default pagination values', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of([]));

      await controller.getOrders(mockReq, undefined as any, undefined as any);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-orders', expect.objectContaining({
        pagination: { limit: 10, page: 1 },
      }));
    });

    it('should apply date filters when provided', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of([]));

      await controller.getOrders(mockReq, 20 as any, 2 as any, '2024-01-01', '2024-12-31');

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-orders', expect.objectContaining({
        dateFilter: { startDate: '2024-01-01', endDate: '2024-12-31' },
      }));
    });

    it('should handle custom pagination values', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of([]));

      await controller.getOrders(mockReq, 50 as any, 3 as any);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-orders', expect.objectContaining({
        pagination: { limit: 50, page: 3 },
      }));
    });

    it('should handle empty orders list', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockOrdersService.send.mockReturnValue(of([]));

      const result = await controller.getOrders(mockReq, 10 as any, 1 as any);
      const resolvedResult = await firstValueFrom(result);

      expect(resolvedResult).toEqual([]);
    });
  });

  describe('checkout', () => {
    it('should process checkout with order quantity', async () => {
      const checkoutDto = { quantity: 5 };
      const mockReq = { user: { accountId: 1, userId: 5 } };
      const orderId = 42;

      mockOrdersService.send.mockReturnValue(of({ orderId: 42, status: 'CONFIRMED' }));

      const result = controller.checkout(checkoutDto, mockReq, orderId);
      const resolvedResult = await firstValueFrom(result);

      expect(mockOrdersService.send).toHaveBeenCalledWith('checkout-order', expect.objectContaining({
        accountId: 1,
        quantity: 5,
        orderId: 42,
      }));
      expect(resolvedResult).toEqual({ orderId: 42, status: 'CONFIRMED' });
    });

    it('should include order ID in checkout payload', async () => {
      const checkoutDto = { quantity: 3 };
      const mockReq = { user: { accountId: 2, userId: 10 } };
      const orderId = 99;

      const result = controller.checkout(checkoutDto, mockReq, orderId);
      await firstValueFrom(result);

      expect(mockOrdersService.send).toHaveBeenCalledWith('checkout-order', expect.objectContaining({
        orderId: 99,
      }));
    });
  });

  describe('updateOrder', () => {
    it('should update order status', async () => {
      const body = { status: 'PROCESSING' };
      const mockReq = { user: { accountId: 1, userId: 5 } };
      const orderId = 42;

      mockOrdersService.send.mockReturnValue(of({ id: 42, status: 'PROCESSING' }));

      const result = await controller.updateOrder(body, orderId, mockReq);

      expect(mockOrdersService.send).toHaveBeenCalledWith('update-order', expect.objectContaining({
        orderId: 42,
        updateStatusDto: { status: 'PROCESSING' },
        userId: 1,
      }));
    });

    it('should include user ID in update payload', async () => {
      const body = { status: 'CONFIRMED' };
      const mockReq = { user: { accountId: 3, userId: 15 } };
      const orderId = 55;

      const result = await controller.updateOrder(body, orderId, mockReq);

      expect(mockOrdersService.send).toHaveBeenCalledWith('update-order', expect.objectContaining({
        userId: 3,
      }));
    });
  });

  describe('getOrder', () => {
    it('should retrieve single order by ID', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };
      const orderId = 42;
      const mockOrder = { id: 42, totalAmount: 500, status: 'PROCESSING', items: [] };

      mockOrdersService.send.mockReturnValue(of(mockOrder));

      const result = await controller.getOrder(orderId, mockReq);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-order', expect.objectContaining({
        orderId: 42,
        userId: 1,
      }));
    });

    it('should pass user context in order retrieval', async () => {
      const mockReq = { user: { accountId: 2, userId: 10 } };
      const orderId = 99;

      await controller.getOrder(orderId, mockReq);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-order', expect.objectContaining({
        userId: 2,
      }));
    });

    it('should handle missing user context', async () => {
      const mockReq = { user: undefined };
      const orderId = 42;

      mockOrdersService.send.mockReturnValue(of(null));

      await controller.getOrder(orderId, mockReq);

      expect(mockOrdersService.send).toHaveBeenCalledWith('get-order', expect.objectContaining({
        userId: undefined,
      }));
    });
  });
});
