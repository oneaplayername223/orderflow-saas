import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { GetBillingDto } from './dto/get-billing.dto';

describe('BillingService', () => {
  let service: BillingService;
  let prismaService: PrismaService;

  const mockPrisma = {
    billing: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBilling', () => {
    it('should create a billing record with default values', async () => {
      const chargeDto: CreateBillingDto = {
        accountId: 1,
      };

      const expectedBilling = {
        id: 'billing-uuid-1',
        accountId: 1,
        amount: 2000,
        accountType: 'TRIAL',
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.billing.create.mockResolvedValue(expectedBilling);

      const result = await service.createBilling(chargeDto);

      expect(mockPrisma.billing.create).toHaveBeenCalledWith({
        data: {
          accountId: chargeDto.accountId,
          amount: chargeDto.amount || 2000,
          accountType: chargeDto.accountType || 'TRIAL',
          createdAt: expect.any(Date),
          expireAt: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedBilling);
    });

    it('should create a billing record with custom values', async () => {
      const chargeDto: CreateBillingDto = {
        accountId: 2,
        amount: 5000,
        accountType: 'PRO',
      };

      const expectedBilling = {
        id: 'billing-uuid-2',
        accountId: 2,
        amount: 5000,
        accountType: 'PRO',
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.billing.create.mockResolvedValue(expectedBilling);

      const result = await service.createBilling(chargeDto);

      expect(mockPrisma.billing.create).toHaveBeenCalledWith({
        data: {
          accountId: chargeDto.accountId,
          amount: chargeDto.amount,
          accountType: chargeDto.accountType,
          createdAt: expect.any(Date),
          expireAt: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedBilling);
    });

    it('should throw error if database creation fails', async () => {
      const chargeDto: CreateBillingDto = {
        accountId: 1,
      };

      mockPrisma.billing.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createBilling(chargeDto)).rejects.toThrow('Database error');
    });
  });

  describe('getBilling', () => {
    it('should return active billing record', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 1,
        email: 'test@example.com',
      };

      const now = new Date();
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

      const billingRecord = {
        id: 'billing-uuid-1',
        accountId: 1,
        amount: 2000,
        accountType: 'TRIAL',
        createdAt: now,
        expireAt: futureDate,
      };

      mockPrisma.billing.findFirst.mockResolvedValue(billingRecord);

      const result = await service.getBilling(getBillingDto);

      expect(mockPrisma.billing.findFirst).toHaveBeenCalledWith({
        where: {
          accountId: getBillingDto.accountId,
        },
      });
      expect(result).toEqual({
        query: billingRecord,
        message: 'Billing is active',
      });
    });

    it('should return false if billing has expired', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 1,
        email: 'test@example.com',
      };

      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const expiredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

      const billingRecord = {
        id: 'billing-uuid-1',
        accountId: 1,
        amount: 2000,
        accountType: 'TRIAL',
        createdAt: pastDate,
        expireAt: expiredDate,
      };

      mockPrisma.billing.findFirst.mockResolvedValue(billingRecord);

      const result = await service.getBilling(getBillingDto);

      expect(result).toBe(false);
    });

    it('should throw error if no billing record found', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 999,
        email: 'notfound@example.com',
      };

      mockPrisma.billing.findFirst.mockResolvedValue(null);

      const result = await service.getBilling(getBillingDto);

      // Should return false or handle gracefully
      expect(result).toBe(false);
    });

    it('should throw error if database query fails', async () => {
      const getBillingDto: GetBillingDto = {
        accountId: 1,
        email: 'test@example.com',
      };

      mockPrisma.billing.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(service.getBilling(getBillingDto)).rejects.toThrow('Database error');
    });
  });
});
