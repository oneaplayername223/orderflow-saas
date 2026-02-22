import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { CheckoutModule } from './checkout/checkout.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
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

    it('should have CheckoutModule imported', () => {
      const checkoutModule = module.get(CheckoutModule);
      expect(checkoutModule).toBeDefined();
    });
  });

  describe('Module Structure', () => {
    it('should have all required imports', () => {
      const appModule = module.get(AppModule);
      expect(appModule).toBeDefined();
    });

    it('should be able to resolve dependencies', () => {
      expect(() => {
        module.get(AppModule);
      }).not.toThrow();
    });
  });
});
