import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RpcException } from '@nestjs/microservices';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    updateOrder: jest.fn(),
    checkoutOrder: jest.fn(),
    getOrder: jest.fn(),
    getOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const payload = {
        user_id: { accountId: 1, userId: 5 },
        type: 'PURCHASE',
        totalAmount: 100,
        items: [{ referenceName: 'Item1', quantity: 2, unitPrice: 50 }],
      };

      const mockOrder = { id: 1, ...payload };
      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(payload as any);

      expect(result).toEqual(mockOrder);
      expect(service.create).toHaveBeenCalledWith(payload);
    });

    it('should throw RpcException if order not created', async () => {
      const payload = { user_id: { accountId: 1, userId: 5 }, items: [] };
      mockOrdersService.create.mockResolvedValue(null);

      await expect(controller.createOrder(payload as any)).rejects.toThrow(RpcException);
    });
  });

  describe('updateOrder', () => {
    it('should update order status', async () => {
      const payload = { orderId: 1, userId: 1, updateStatusDto: { status: 'PROCESSING' } };
      const mockOrder = { id: 1, status: 'PROCESSING' };
      mockOrdersService.updateOrder.mockResolvedValue(mockOrder);

      const result = await controller.updateOrder(payload);

      expect(result).toEqual(mockOrder);
      expect(service.updateOrder).toHaveBeenCalledWith(payload);
    });

    it('should handle update errors', async () => {
      const payload = { orderId: 1, userId: 1, updateStatusDto: { status: 'COMPLETED' } };
      mockOrdersService.updateOrder.mockRejectedValue(new RpcException('Cannot update completed order'));

      await expect(controller.updateOrder(payload)).rejects.toThrow();
    });
  });

  describe('checkoutOrder', () => {
    it('should process checkout', async () => {
      const payload = { orderId: 1, accountId: 1, quantity: 2 };
      const mockCheckout = { orderId: 1, quantity: 2, totalPaid: '100.00', status: 'CONFIRMED' };
      mockOrdersService.checkoutOrder.mockResolvedValue(mockCheckout);

      const result = await controller.checkoutOrder(payload);

      expect(result).toEqual(mockCheckout);
      expect(service.checkoutOrder).toHaveBeenCalledWith(payload);
    });

    it('should handle checkout errors', async () => {
      const payload = { orderId: 1, accountId: 1, quantity: 0 };
      mockOrdersService.checkoutOrder.mockRejectedValue(new RpcException('Invalid quantity'));

      await expect(controller.checkoutOrder(payload)).rejects.toThrow();
    });
  });

  describe('getOrder', () => {
    it('should return single order', async () => {
      const payload = { orderId: 1, userId: 1 };
      const mockOrder = { id: 1, totalAmount: 100, items: [] };
      mockOrdersService.getOrder.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(payload);

      expect(result).toEqual(mockOrder);
      expect(service.getOrder).toHaveBeenCalledWith(payload);
    });

    it('should handle order not found', async () => {
      const payload = { orderId: 999, userId: 1 };
      mockOrdersService.getOrder.mockRejectedValue(new RpcException('Order not found'));

      await expect(controller.getOrder(payload)).rejects.toThrow();
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const payload = {
        page: 1,
        limit: 10,
        user_id: 1,
        dateFilter: {},
      };

      const mockOrders = [
        
        { id: 1, totalAmount: 100 },
        { id: 2, totalAmount: 200 },
      ];
      mockOrdersService.getOrders.mockResolvedValue(mockOrders);

      const result = await controller.getOrders(payload);

      expect(result).toEqual(mockOrders);
      expect(service.getOrders).toHaveBeenCalledWith(payload);
    });

    it('should handle empty orders list', async () => {
      const payload = {
        page: 1,
        limit: 10,
        user_id: 1,
        pagination: { limit: 10, page: 1 },
        dateFilter: {},
      };

      mockOrdersService.getOrders.mockResolvedValue([]);

      const result = await controller.getOrders(payload);

      expect(result).toEqual([]);
    });
  });
});
