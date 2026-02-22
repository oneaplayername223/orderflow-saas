import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutModule } from './checkout.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

describe('CheckoutModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CheckoutModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue({
        send: jest.fn(),
      })
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Module Initialization', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should compile successfully', async () => {
      expect(module).toBeDefined();
    });

    it('should have CheckoutService available', () => {
      const service = module.get<CheckoutService>(CheckoutService);
      expect(service).toBeDefined();
    });

    it('should have CheckoutController available', () => {
      const controller = module.get<CheckoutController>(CheckoutController);
      expect(controller).toBeDefined();
    });

    it('should have AUTH_SERVICE provider available', () => {
      const authService = module.get('AUTH_SERVICE');
      expect(authService).toBeDefined();
    });
  });

  describe('Module Dependencies', () => {
    it('should resolve CheckoutService with dependencies', () => {
      expect(() => {
        module.get<CheckoutService>(CheckoutService);
      }).not.toThrow();
    });

    it('should resolve CheckoutController with dependencies', () => {
      expect(() => {
        module.get<CheckoutController>(CheckoutController);
      }).not.toThrow();
    });

    it('should inject AUTH_SERVICE into CheckoutService', () => {
      const service = module.get<CheckoutService>(CheckoutService);
      expect(service).toBeDefined();
    });
  });
});
