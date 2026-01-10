import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let authService: ClientProxy;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuthService = {
    send: jest.fn().mockReturnValue(of({ 
      query: { 
        email: 'test@example.com', 
        username: 'testuser', 
        company_name: 'TestCorp' 
      } 
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'AUTH_SERVICE', useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<ClientProxy>('AUTH_SERVICE');
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with default role and status', async () => {
      const accountId = 1;
      const mockUser = { id: 1, accountId, role: 'ADMIN', status: 'ACTIVE', createdAt: new Date() };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(accountId);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { accountId, role: 'ADMIN', status: 'ACTIVE' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user creation fails', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createUser(1)).rejects.toThrow('Database error');
    });

    it('should create user with correct accountId', async () => {
      const accountId = 42;
      mockPrisma.user.create.mockResolvedValue({ id: 1, accountId, role: 'ADMIN', status: 'ACTIVE' });

      await service.createUser(accountId);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ accountId }),
        }),
      );
    });
  });

  describe('getUser', () => {
    it('should return user role and status', async () => {
      const accountId = 1;
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, accountId, role: 'USER', status: 'ACTIVE' });

      const result = await service.getUser(accountId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { accountId } });
      expect(result).toEqual({ role: 'USER', status: 'ACTIVE' });
    });

    it('should return undefined if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUser(999);

      expect(result).toEqual({ role: 'undefined', status: 'undefined' });
    });

    it('should convert role and status to strings', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, accountId: 1, role: 'ADMIN', status: 'INACTIVE' });

      const result = await service.getUser(1);

      expect(typeof result.role).toBe('string');
      expect(typeof result.status).toBe('string');
      expect(result).toEqual({ role: 'ADMIN', status: 'INACTIVE' });
    });
  });

  describe('getUserProfile', () => {
    it('should return complete user profile with auth service data', async () => {
      const accountId = 1;
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, accountId, role: 'ADMIN', status: 'ACTIVE' });
      mockAuthService.send.mockReturnValue(of({
        query: { email: 'admin@example.com', username: 'admin', company_name: 'AdminCorp' },
      }));

      const result = await service.getUserProfile(accountId);

      expect(result).toEqual({
        role: 'ADMIN',
        status: 'ACTIVE',
        company_name: 'AdminCorp',
        email: 'admin@example.com',
        username: 'admin',
      });
    });

    it('should call auth service to get account details', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, accountId: 2, role: 'USER', status: 'ACTIVE' });
      mockAuthService.send.mockReturnValue(of({
        query: { email: 'user@example.com', username: 'user', company_name: 'UserCorp' },
      }));

      await service.getUserProfile(2);

      expect(mockAuthService.send).toHaveBeenCalledWith('get-user', 2);
    });

    it('should handle null values from database', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockAuthService.send.mockReturnValue(of({
        query: { email: 'test@example.com', username: 'test', company_name: 'TestCorp' },
      }));

      const result = await service.getUserProfile(999);

      expect(result.role).toBe('undefined');
      expect(result.status).toBe('undefined');
    });

    it('should fetch from auth service only once per call', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, accountId: 1, role: 'USER', status: 'ACTIVE' });

      await service.getUserProfile(1);

      expect(mockAuthService.send).toHaveBeenCalledTimes(1);
    });
  });});
