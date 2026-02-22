import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { RpcException } from '@nestjs/microservices';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;
  let module: TestingModule;

  const mockCheckoutService = {
    checkoutPdf: jest.fn(),
  };

  const mockAuthService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have checkoutPdf method', () => {
      expect(controller.checkoutPdf).toBeDefined();
      expect(typeof controller.checkoutPdf).toBe('function');
    });
  });

  describe('checkoutPdf Message Pattern Handler', () => {
    const mockPdfData = {
      referenceName: 'Product A',
      description: 'Test product description',
      orderQuantity: 5,
      paymentId: 'PAY-123456',
      unitPrice: '99.99',
      subtotal: '499.95',
      orderItemPrice: '499.95',
      companyId: 'COMP-123',
      orderId: 'ORD-456',
      currency: 'USD',
      status: 'CONFIRMED',
      provider: 'Test Provider',
    };

    it('should successfully handle checkoutPdf message pattern', async () => {
      const mockResult = {
        filePath: '/path/to/factura_ORD-456_123456.pdf',
        fileName: 'factura_ORD-456_123456.pdf',
      };

      mockCheckoutService.checkoutPdf.mockResolvedValue(mockResult);

      const result = await controller.checkoutPdf(mockPdfData);

      expect(result).toEqual(mockResult);
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledWith(mockPdfData);
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledTimes(1);
    });

    it('should return file path and fileName in response', async () => {
      const mockResult = {
        filePath: '/facturas/factura_ORD-123_456789.pdf',
        fileName: 'factura_ORD-123_456789.pdf',
      };

      mockCheckoutService.checkoutPdf.mockResolvedValue(mockResult);

      const result = await controller.checkoutPdf(mockPdfData);

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('fileName');
      expect(result.filePath).toContain('factura');
      expect(result.fileName).toMatch(/^factura_ORD-\d+_\d+\.pdf$/);
    });

    it('should throw RpcException when service throws error', async () => {
      const error = new Error('PDF generation failed');
      mockCheckoutService.checkoutPdf.mockRejectedValue(error);

      await expect(controller.checkoutPdf(mockPdfData)).rejects.toThrow(
        RpcException,
      );
    });

    it('should wrap service errors in RpcException with proper message', async () => {
      const serviceError = new Error('Disk full');
      mockCheckoutService.checkoutPdf.mockRejectedValue(serviceError);

      try {
        await controller.checkoutPdf(mockPdfData);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toHaveProperty('message', 'Error generating PDF');
        expect(error.getError()).toHaveProperty('error');
      }
    });

    it('should handle null/undefined data gracefully', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/file.pdf',
        fileName: 'file.pdf',
      });

      const result = await controller.checkoutPdf({});

      expect(result).toBeDefined();
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledWith({});
    });

    it('should handle multiple concurrent requests', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/factura.pdf',
        fileName: 'factura.pdf',
      });

      const results = await Promise.all([
        controller.checkoutPdf(mockPdfData),
        controller.checkoutPdf({ ...mockPdfData, orderId: 'ORD-001' }),
        controller.checkoutPdf({ ...mockPdfData, orderId: 'ORD-002' }),
      ]);

      expect(results).toHaveLength(3);
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result).toHaveProperty('filePath');
        expect(result).toHaveProperty('fileName');
      });
    });

    it('should pass complete data payload to service', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/file.pdf',
        fileName: 'file.pdf',
      });

      await controller.checkoutPdf(mockPdfData);

      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledWith(mockPdfData);
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceName: mockPdfData.referenceName,
          orderQuantity: mockPdfData.orderQuantity,
          paymentId: mockPdfData.paymentId,
          companyId: mockPdfData.companyId,
          orderId: mockPdfData.orderId,
        }),
      );
    });

    it('should handle service timeout gracefully', async () => {
      mockCheckoutService.checkoutPdf.mockRejectedValue(
        new Error('Service timeout'),
      );

      await expect(controller.checkoutPdf(mockPdfData)).rejects.toThrow();
    });

    it('should successfully process PDF request', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/factura_ORD-456_123456.pdf',
        fileName: 'factura_ORD-456_123456.pdf',
      });

      const result = await controller.checkoutPdf(mockPdfData);

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();
    });

    it('should handle empty string values in data', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/file.pdf',
        fileName: 'file.pdf',
      });

      const dataWithEmpty = {
        ...mockPdfData,
        description: '',
        provider: '',
      };

      const result = await controller.checkoutPdf(dataWithEmpty);

      expect(result).toBeDefined();
      expect(mockCheckoutService.checkoutPdf).toHaveBeenCalledWith(dataWithEmpty);
    });

    it('should handle special characters in input data', async () => {
      mockCheckoutService.checkoutPdf.mockResolvedValue({
        filePath: '/path/to/file.pdf',
        fileName: 'file.pdf',
      });

      const dataWithSpecialChars = {
        ...mockPdfData,
        referenceName: 'Product <>&" Special',
        description: "It's a test & demo",
      };

      const result = await controller.checkoutPdf(dataWithSpecialChars);

      expect(result).toBeDefined();
    });

    it('should provide meaningful error information to caller', async () => {
      const serviceError = new Error('Auth service unavailable');
      mockCheckoutService.checkoutPdf.mockRejectedValue(serviceError);

      try {
        await controller.checkoutPdf(mockPdfData);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toBeDefined();
        expect((error.getError() as any).message).toContain('Error generating PDF');
      }
    });

    it('should maintain data integrity through request-response cycle', async () => {
      const expectedResult = {
        filePath: '/facturas/factura_ORD-456_123456789.pdf',
        fileName: 'factura_ORD-456_123456789.pdf',
      };

      mockCheckoutService.checkoutPdf.mockResolvedValue(expectedResult);

      const result = await controller.checkoutPdf(mockPdfData);

      expect(result).toStrictEqual(expectedResult);
      expect(result.filePath).toBe(expectedResult.filePath);
      expect(result.fileName).toBe(expectedResult.fileName);
    });
  });
});
