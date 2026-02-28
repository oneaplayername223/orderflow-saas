import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { GetBillingDto } from './dto/get-billing.dto';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;

  const mockBillingService = {
    createBilling: jest.fn(),
    getBilling: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: mockBillingService,
        },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('chargeCustomer / create-billing', () => {
    it('should create a billing record and return success', async () => {
      const createBillingDto: CreateBillingDto = {
        accountId: 1,
        amount: 2500,
        accountType: 'NORMAL',
      };

      const expectedBilling = {
        id: 'billing-uuid-1',
        accountId: 1,
        amount: 2500,
        accountType: 'NORMAL',
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockBillingService.createBilling.mockResolvedValue(expectedBilling);

      const result = await controller.chargeCustomer(createBillingDto);

      expect(result).toEqual({ success: expectedBilling });
      expect(service.createBilling).toHaveBeenCalledWith(createBillingDto);
    });

    it('should handle default values from service', async () => {
      const createBillingDto: CreateBillingDto = {
        accountId: 2,
      };

      const expectedBilling = {
        id: 'billing-uuid-2',
        accountId: 2,
        amount: 2000, // default
        accountType: 'TRIAL', // default
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockBillingService.createBilling.mockResolvedValue(expectedBilling);

      const result = await controller.chargeCustomer(createBillingDto);

      expect(result).toEqual({ success: expectedBilling });
      expect(service.createBilling).toHaveBeenCalledWith(createBillingDto);
    });

    it('should throw error if service fails', async () => {
      const createBillingDto: CreateBillingDto = {
        accountId: 1,
      };

      mockBillingService.createBilling.mockRejectedValue(new Error('Database error'));

      await expect(controller.chargeCustomer(createBillingDto)).rejects.toThrow('Database error');
    });
  });

  describe('getBilling / get-billing', () => {
    it('should return active billing record', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 1,
        email: 'user@example.com',
      };

      const billingData = {
        query: {
          id: 'billing-uuid-1',
          accountId: 1,
          amount: 2000,
          accountType: 'TRIAL',
          createdAt: new Date(),
          expireAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        message: 'Billing is active',
      };

      mockBillingService.getBilling.mockResolvedValue(billingData);

      const result = await controller.getBilling(getBillingDto);

      expect(result).toEqual({ success: billingData });
      expect(service.getBilling).toHaveBeenCalledWith(getBillingDto);
    });

    it('should return expired billing status', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 2,
        email: 'expired@example.com',
      };

      mockBillingService.getBilling.mockResolvedValue(false);

      const result = await controller.getBilling(getBillingDto);

      expect(result).toEqual({ success: false });
      expect(service.getBilling).toHaveBeenCalledWith(getBillingDto);
    });

    it('should handle user not found gracefully', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 999,
        email: 'notfound@example.com',
      };

      mockBillingService.getBilling.mockResolvedValue(false);

      const result = await controller.getBilling(getBillingDto);

      expect(result).toEqual({ success: false });
    });

    it('should throw error if service fails', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 1,
        email: 'test@example.com',
      };

      mockBillingService.getBilling.mockRejectedValue(new Error('Database error'));

      await expect(controller.getBilling(getBillingDto)).rejects.toThrow('Database error');
    });
  });
});
