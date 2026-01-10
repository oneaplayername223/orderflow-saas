import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationServiceClient: ClientProxy;

  const mockNotificationService = {
    emit: jest.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationServiceClient = module.get<ClientProxy>('NOTIFICATION_SERVICE');
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerNotification', () => {
    it('should emit register-succeeded-mail event', async () => {
      const data = { email: 'test@example.com', username: 'testuser' };

      await service.registerNotification(data);

      expect(mockNotificationService.emit).toHaveBeenCalledWith('register-succeeded-mail', data);
    });

    it('should log welcome message with username', async () => {
      const data = { email: 'john@example.com', username: 'john' };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.registerNotification(data);

      expect(consoleSpy).toHaveBeenCalledWith('Welcome!', 'john', 'Your account has been created successfully.');
    });

    it('should pass full data object to emit', async () => {
      const data = {
        email: 'user@example.com',
        username: 'user123',
        company_name: 'TestCorp',
      };

      await service.registerNotification(data);

      expect(mockNotificationService.emit).toHaveBeenCalledWith('register-succeeded-mail', data);
    });
  });

  describe('loginNotification', () => {
    it('should emit login-succeeded-mail event', async () => {
      const data = { email: 'test@example.com', username: 'testuser', ip: '127.0.0.1' };

      await service.loginNotification(data);

      expect(mockNotificationService.emit).toHaveBeenCalledWith('login-succeeded-mail', data);
    });

    it('should log login information with IP', async () => {
      const data = { email: 'test@example.com', username: 'testuser', ip: '192.168.1.1' };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.loginNotification(data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
          message: 'User logged in successfully',
          ip: '192.168.1.1',
        }),
      );
    });

    it('should include IP address in logs', async () => {
      const data = { email: 'user@example.com', username: 'user123', ip: '10.0.0.1' };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.loginNotification(data);

      const callArg = consoleSpy.mock.calls[0][0];
      expect(callArg.ip).toBe('10.0.0.1');
    });
  });

  describe('loginFailedNotification', () => {
    it('should log login failed message', async () => {
      const data = { email: 'test@example.com', username: 'testuser' };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.loginFailedNotification(data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
          message: 'User login failed',
        }),
      );
    });

    it('should include email and username in failed login log', async () => {
      const data = { email: 'failed@example.com', username: 'faileduser' };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.loginFailedNotification(data);

      const callArg = consoleSpy.mock.calls[0][0];
      expect(callArg.email).toBe('failed@example.com');
      expect(callArg.username).toBe('faileduser');
    });
  });

  describe('paymentCreated', () => {
    it('should log payment created message', async () => {
      const data = {
        orderItemPrice: 100,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 1,
        status: 'PAID',
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.paymentCreated(data);

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('Payment registered successfully');
      expect(logMessage).toContain('100 DOP');
      expect(logMessage).toContain('MOCK');
    });

    it('should include order details in log', async () => {
      const data = {
        orderItemPrice: 250.50,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 42,
        status: 'PAID',
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.paymentCreated(data);

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('42');
      expect(logMessage).toContain('PAID');
    });
  });

  describe('paymentFailed', () => {
    it('should log payment failed message', async () => {
      const data = {
        orderItemPrice: 100,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 1,
        status: 'FAILED',
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.paymentFailed(data);

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('Payment failed');
      expect(logMessage).toContain('Please Contact Support');
    });

    it('should include failed payment details', async () => {
      const data = {
        orderItemPrice: 500,
        currency: 'DOP',
        provider: 'MOCK',
        orderId: 99,
        status: 'FAILED',
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.paymentFailed(data);

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('500 DOP');
      expect(logMessage).toContain('99');
      expect(logMessage).toContain('FAILED');
    });
  });

  describe('orderConfirmed', () => {
    it('should log order confirmed message', async () => {
      const data = {
        orderItemPrice: 100,
        quantity: 5,
        orderId: 1,
        status: 'CONFIRMED',
        date: new Date('2024-01-15'),
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.orderConfirmed(data);

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('Order Confirmed successfully');
      expect(logMessage).toContain('100');
      expect(logMessage).toContain('5');
    });

    it('should include all order details in confirmation log', async () => {
      const testDate = new Date('2024-12-25');
      const data = {
        orderItemPrice: 250,
        quantity: 3,
        orderId: 42,
        status: 'CONFIRMED',
        date: testDate,
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.orderConfirmed(data);

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('250');
      expect(logMessage).toContain('42');
      expect(logMessage).toContain('3');
      expect(logMessage).toContain('CONFIRMED');
    });

    it('should use dollar sign in price display', async () => {
      const data = {
        orderItemPrice: 100,
        quantity: 2,
        orderId: 1,
        status: 'CONFIRMED',
        date: new Date(),
      };
      const consoleSpy = jest.spyOn(console, 'log');

      await service.orderConfirmed(data);

      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toContain('$');
    });
  });
});
