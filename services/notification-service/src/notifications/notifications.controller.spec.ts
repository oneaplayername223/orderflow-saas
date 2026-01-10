import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    registerNotification: jest.fn(),
    loginNotification: jest.fn(),
    loginFailedNotification: jest.fn(),
    paymentCreated: jest.fn(),
    paymentFailed: jest.fn(),
    orderConfirmed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerNotification', () => {
    it('should call registerNotification on service', async () => {
      const data = { email: 'test@example.com', username: 'testuser' };
      mockNotificationsService.registerNotification.mockResolvedValue(undefined);

      await controller.registerNotification(data);

      expect(service.registerNotification).toHaveBeenCalledWith(data);
    });

    it('should return service response', async () => {
      const data = { email: 'test@example.com', username: 'testuser' };
      mockNotificationsService.registerNotification.mockResolvedValue(undefined);

      const result = await controller.registerNotification(data);

      expect(result).toBeUndefined();
    });
  });

  describe('loginNotification', () => {
    it('should call loginNotification on service', async () => {
      const data = { email: 'test@example.com', username: 'testuser', ip: '127.0.0.1' };
      mockNotificationsService.loginNotification.mockResolvedValue(undefined);

      await controller.loginNotification(data);

      expect(service.loginNotification).toHaveBeenCalledWith(data);
    });

    it('should pass IP address in data', async () => {
      const data = { email: 'test@example.com', username: 'testuser', ip: '192.168.1.1' };
      mockNotificationsService.loginNotification.mockResolvedValue(undefined);

      await controller.loginNotification(data);

      expect(service.loginNotification).toHaveBeenCalledWith(expect.objectContaining({ ip: '192.168.1.1' }));
    });
  });

  describe('loginFailedNotification', () => {
    it('should call loginFailedNotification on service', async () => {
      const data = { email: 'test@example.com', username: 'testuser' };
      mockNotificationsService.loginFailedNotification.mockResolvedValue(undefined);

      await controller.loginFailedNotification(data);

      expect(service.loginFailedNotification).toHaveBeenCalledWith(data);
    });

    it('should handle failed login attempt', async () => {
      const data = { email: 'failed@example.com', username: 'faileduser' };
      mockNotificationsService.loginFailedNotification.mockResolvedValue(undefined);

      await controller.loginFailedNotification(data);

      expect(service.loginFailedNotification).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'failed@example.com' }),
      );
    });
  });

  describe('paymentCreated', () => {
    it('should call paymentCreated on service', async () => {
      const data = {
        orderItemPrice: 100,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 1,
        status: 'PAID',
      };
      mockNotificationsService.paymentCreated.mockResolvedValue(undefined);

      await controller.paymentCreated(data);

      expect(service.paymentCreated).toHaveBeenCalledWith(data);
    });

    it('should handle payment success notification', async () => {
      const data = {
        orderItemPrice: 250.50,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 42,
        status: 'PAID',
      };
      mockNotificationsService.paymentCreated.mockResolvedValue(undefined);

      await controller.paymentCreated(data);

      expect(service.paymentCreated).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PAID', orderId: 42 }),
      );
    });
  });

  describe('paymentFailed', () => {
    it('should call paymentFailed on service', async () => {
      const data = {
        orderItemPrice: 100,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 1,
        status: 'FAILED',
      };
      mockNotificationsService.paymentFailed.mockResolvedValue(undefined);

      await controller.paymentFailed(data);

      expect(service.paymentFailed).toHaveBeenCalledWith(data);
    });

    it('should handle payment failure notification', async () => {
      const data = {
        orderItemPrice: 500,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 99,
        status: 'FAILED',
      };
      mockNotificationsService.paymentFailed.mockResolvedValue(undefined);

      await controller.paymentFailed(data);

      expect(service.paymentFailed).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'FAILED', orderId: 99 }),
      );
    });
  });

  describe('orderConfirmed', () => {
    it('should call orderConfirmed on service', async () => {
      const data = {
        orderItemPrice: 100,
        quantity: 5,
        orderId: 1,
        status: 'CONFIRMED',
        date: new Date(),
      };
      mockNotificationsService.orderConfirmed.mockResolvedValue(undefined);

      await controller.orderConfirmed(data);

      expect(service.orderConfirmed).toHaveBeenCalledWith(data);
    });

    it('should handle order confirmation notification', async () => {
      const data = {
        orderItemPrice: 200,
        quantity: 3,
        orderId: 55,
        status: 'CONFIRMED',
        date: new Date(),
      };
      mockNotificationsService.orderConfirmed.mockResolvedValue(undefined);

      await controller.orderConfirmed(data);

      expect(service.orderConfirmed).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CONFIRMED', quantity: 3 }),
      );
    });
  });
});
